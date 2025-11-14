import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, TrendingUp, AlertCircle, Car, Home, Umbrella, ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
import './index.css';
import './App.css';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { geoCentroid } from 'd3-geo';
import TestDashboardWrapper from './apps/test-dashboard/TestDashboardWrapper.jsx';
import LandingPageSR from './apps/state-rollout/LandingPage.jsx';

const InsuranceAnalyticsPlatform = () => {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [stateData, setStateData] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [fileName, setFileName] = useState('');
  
  // New states for LOB navigation and timeline
  const [selectedLOB, setSelectedLOB] = useState('overview'); // 'overview', 'auto', 'home', 'umbrella'
  const [timelineData, setTimelineData] = useState(null);
  
  // Tree dropdown states
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedQuarters, setExpandedQuarters] = useState({});
  
  // NEW: State to track which year's quarters are visible
  const [selectedYear, setSelectedYear] = useState(null);
  const [appMode, setAppMode] = useState('home');

  const navigate = (mode) => {
    setAppMode(mode);
    if (mode === 'home') window.location.hash = '#/home';
    else if (mode === 'test') window.location.hash = '#/test-dashboard';
    else if (mode === 'state-rollout') window.location.hash = '#/state-rollout';
  };

  useEffect(() => {
    const syncFromHash = () => {
      const h = window.location.hash;
      if (h.includes('test-dashboard')) setAppMode('test');
      else if (h.includes('state-rollout')) setAppMode('state-rollout');
      else setAppMode('home');
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  // Cache US states topology to avoid refetches and remount flicker
  const US_TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';
  const [usTopo, setUsTopo] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch(US_TOPO_URL)
      .then((res) => res.json())
      .then((topology) => { if (mounted) setUsTopo(topology); })
      .catch((err) => console.error('Failed to load US topology', err));
    return () => { mounted = false; };
  }, []);

  // Throttle hover updates to one per animation frame to reduce flicker
  const hoverRaf = useRef(0);
  const hoveredRef = useRef(null);
  useEffect(() => { hoveredRef.current = hoveredState; }, [hoveredState]);
  // Defer hover leave clearing; cancel if a new enter occurs
  const leaveTimeoutRef = useRef(0);
  const cancelLeave = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = 0;
    }
  }, []);
  const setHoverThrottled = useCallback((codeOrNull) => {
    // Skip redundant updates
    if (hoveredRef.current === codeOrNull) return;
    if (hoverRaf.current) cancelAnimationFrame(hoverRaf.current);
    hoverRaf.current = requestAnimationFrame(() => setHoveredState(codeOrNull));
  }, [setHoveredState]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log('Loaded Excel data:', jsonData);
        const processedData = processExcelData(jsonData);
        setStateData(processedData.stateMap);
        setKpiData(processedData.kpis);
        setTimelineData(processedData.timeline);
        setFileUploaded(true);
      } catch (err) {
        alert('Failed to read file. Ensure it is a valid Excel (.xlsx/.xls).');
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const stateAbbreviations = {
    'Alabama': 'AL','Alaska': 'AK','Arizona': 'AZ','Arkansas': 'AR','California': 'CA','Colorado': 'CO','Connecticut': 'CT','Delaware': 'DE','District of Columbia': 'DC','Florida': 'FL','Georgia': 'GA','Hawaii': 'HI','Idaho': 'ID','Illinois': 'IL','Indiana': 'IN','Iowa': 'IA','Kansas': 'KS','Kentucky': 'KY','Louisiana': 'LA','Maine': 'ME','Maryland': 'MD','Massachusetts': 'MA','Michigan': 'MI','Minnesota': 'MN','Mississippi': 'MS','Missouri': 'MO','Montana': 'MT','Nebraska': 'NE','Nevada': 'NV','New Hampshire': 'NH','New Jersey': 'NJ','New Mexico': 'NM','New York': 'NY','North Carolina': 'NC','North Dakota': 'ND','Ohio': 'OH','Oklahoma': 'OK','Oregon': 'OR','Pennsylvania': 'PA','Rhode Island': 'RI','South Carolina': 'SC','South Dakota': 'SD','Tennessee': 'TN','Texas': 'TX','Utah': 'UT','Vermont': 'VT','Virginia': 'VA','Washington': 'WA','West Virginia': 'WV','Wisconsin': 'WI','Wyoming': 'WY'
  };

  // Simplified USA map positions for all states
  const statePositions = {
    'AK': { x: 10, y: 450, width: 100, height: 70 },
    'HI': { x: 250, y: 450, width: 80, height: 40 },
    'WA': { x: 70, y: 20, width: 90, height: 70 },
    'OR': { x: 70, y: 90, width: 90, height: 60 },
    'CA': { x: 40, y: 150, width: 90, height: 150 },
    'NV': { x: 130, y: 150, width: 70, height: 100 },
    'ID': { x: 160, y: 50, width: 70, height: 100 },
    'MT': { x: 230, y: 20, width: 120, height: 70 },
    'WY': { x: 230, y: 90, width: 90, height: 70 },
    'UT': { x: 200, y: 160, width: 70, height: 90 },
    'CO': { x: 270, y: 160, width: 90, height: 80 },
    'AZ': { x: 150, y: 250, width: 80, height: 90 },
    'NM': { x: 230, y: 240, width: 80, height: 100 },
    'ND': { x: 350, y: 20, width: 90, height: 60 },
    'SD': { x: 350, y: 80, width: 90, height: 60 },
    'NE': { x: 360, y: 140, width: 90, height: 60 },
    'KS': { x: 360, y: 200, width: 90, height: 60 },
    'OK': { x: 360, y: 260, width: 100, height: 60 },
    'TX': { x: 310, y: 320, width: 130, height: 130 },
    'MN': { x: 440, y: 50, width: 90, height: 90 },
    'IA': { x: 450, y: 140, width: 80, height: 60 },
    'MO': { x: 460, y: 200, width: 80, height: 70 },
    'AR': { x: 480, y: 270, width: 70, height: 60 },
    'LA': { x: 490, y: 330, width: 80, height: 70 },
    'WI': { x: 530, y: 80, width: 70, height: 90 },
    'IL': { x: 540, y: 170, width: 60, height: 100 },
    'MI': { x: 600, y: 90, width: 90, height: 100 },
    'IN': { x: 600, y: 190, width: 50, height: 80 },
    'OH': { x: 650, y: 180, width: 70, height: 70 },
    'KY': { x: 620, y: 250, width: 90, height: 50 },
    'TN': { x: 600, y: 300, width: 100, height: 50 },
    'MS': { x: 560, y: 350, width: 60, height: 80 },
    'AL': { x: 620, y: 350, width: 60, height: 80 },
    'WV': { x: 720, y: 220, width: 60, height: 70 },
    'VA': { x: 730, y: 250, width: 90, height: 50 },
    'NC': { x: 730, y: 300, width: 100, height: 50 },
    'SC': { x: 730, y: 350, width: 70, height: 60 },
    'GA': { x: 680, y: 380, width: 70, height: 80 },
    'FL': { x: 750, y: 410, width: 80, height: 90 },
    'PA': { x: 780, y: 170, width: 80, height: 60 },
    'NY': { x: 820, y: 110, width: 80, height: 80 },
    'VT': { x: 880, y: 90, width: 40, height: 50 },
    'NH': { x: 900, y: 100, width: 40, height: 50 },
    'ME': { x: 920, y: 50, width: 50, height: 90 },
    'MA': { x: 900, y: 140, width: 50, height: 30 },
    'RI': { x: 920, y: 160, width: 30, height: 20 },
    'CT': { x: 890, y: 170, width: 40, height: 30 },
    'NJ': { x: 860, y: 190, width: 40, height: 50 },
    'DE': { x: 850, y: 220, width: 30, height: 40 },
    'MD': { x: 810, y: 230, width: 60, height: 40 }
  };

  const processExcelData = (jsonData) => {
    const stateMap = {};
    let totalForms = 0, totalAuto = 0, totalHome = 0;
    const complexityCount = { High: 0, Medium: 0, Low: 0 };
    const filingTypes = {}; 
    const regulationTypes = {};
    
    // Execution data from Excel
    const executionData = {
      'AL': { pass: 120, fail: 35, noRun: 25, percentComplete: 66.67 },
      'AK': { pass: 120, fail: 35, noRun: 10, percentComplete: 72.73 },
      'AZ': { pass: 120, fail: 20, noRun: 5, percentComplete: 82.76 },
      'AR': { pass: 120, fail: 35, noRun: 25, percentComplete: 66.67 },
      'CA': { pass: 120, fail: 35, noRun: 25, percentComplete: 66.67 },
      'CO': { pass: 120, fail: 35, noRun: 25, percentComplete: 66.67 },
      'CT': { pass: 120, fail: 35, noRun: 25, percentComplete: 66.67 },
      'DE': { pass: 120, fail: 35, noRun: 25, percentComplete: 66.67 },
      'FL': { pass: 120, fail: 35, noRun: 25, percentComplete: 66.67 },
      'GA': { pass: 120, fail: 35, noRun: 25, percentComplete: 66.67 },
      'HI': { pass: 120, fail: 35, noRun: 25, percentComplete: 66.67 },
      'ID': { pass: 125, fail: 30, noRun: 15, percentComplete: 76.00 },
      'IL': { pass: 118, fail: 40, noRun: 12, percentComplete: 71.00 },
      'IN': { pass: 130, fail: 20, noRun: 10, percentComplete: 83.00 },
      'IA': { pass: 115, fail: 25, noRun: 20, percentComplete: 78.00 },
      'KS': { pass: 140, fail: 10, noRun: 5, percentComplete: 93.00 },
      'KY': { pass: 110, fail: 30, noRun: 15, percentComplete: 76.00 },
      'LA': { pass: 122, fail: 28, noRun: 10, percentComplete: 80.00 },
      'ME': { pass: 128, fail: 25, noRun: 12, percentComplete: 82.00 },
      'MD': { pass: 119, fail: 35, noRun: 11, percentComplete: 74.00 },
      'MA': { pass: 135, fail: 18, noRun: 7, percentComplete: 86.00 },
      'MI': { pass: 127, fail: 22, noRun: 11, percentComplete: 81.00 },
      'MN': { pass: 120, fail: 25, noRun: 20, percentComplete: 78.00 },
      'MS': { pass: 118, fail: 27, noRun: 15, percentComplete: 77.00 },
      'MO': { pass: 130, fail: 15, noRun: 10, percentComplete: 84.00 },
      'MT': { pass: 121, fail: 34, noRun: 15, percentComplete: 76.00 },
      'NE': { pass: 123, fail: 32, noRun: 10, percentComplete: 79.00 },
      'NV': { pass: 140, fail: 10, noRun: 10, percentComplete: 87.00 },
      'NH': { pass: 115, fail: 28, noRun: 12, percentComplete: 80.00 },
      'NJ': { pass: 129, fail: 20, noRun: 10, percentComplete: 83.00 },
      'NM': { pass: 119, fail: 33, noRun: 10, percentComplete: 78.00 },
      'NY': { pass: 117, fail: 38, noRun: 8, percentComplete: 75.00 },
      'NC': { pass: 132, fail: 15, noRun: 8, percentComplete: 86.00 },
      'ND': { pass: 125, fail: 30, noRun: 10, percentComplete: 80.00 },
      'OH': { pass: 137, fail: 12, noRun: 8, percentComplete: 88.00 },
      'OK': { pass: 114, fail: 36, noRun: 10, percentComplete: 76.00 },
      'OR': { pass: 120, fail: 30, noRun: 10, percentComplete: 80.00 },
      'PA': { pass: 135, fail: 18, noRun: 7, percentComplete: 86.00 },
      'RI': { pass: 118, fail: 32, noRun: 10, percentComplete: 78.00 },
      'SC': { pass: 128, fail: 25, noRun: 8, percentComplete: 83.00 },
      'SD': { pass: 123, fail: 28, noRun: 9, percentComplete: 81.00 },
      'TN': { pass: 117, fail: 35, noRun: 10, percentComplete: 77.00 },
      'TX': { pass: 132, fail: 18, noRun: 7, percentComplete: 86.00 },
      'UT': { pass: 125, fail: 30, noRun: 10, percentComplete: 80.00 },
      'VT': { pass: 119, fail: 34, noRun: 8, percentComplete: 79.00 },
      'VA': { pass: 130, fail: 20, noRun: 10, percentComplete: 83.00 },
      'WA': { pass: 127, fail: 25, noRun: 8, percentComplete: 82.00 },
      'WV': { pass: 118, fail: 33, noRun: 9, percentComplete: 78.00 },
      'WI': { pass: 135, fail: 15, noRun: 5, percentComplete: 88.00 },
      'WY': { pass: 120, fail: 28, noRun: 12, percentComplete: 80.00 }
    };
    
    // Predefined Auto LOB Timeline based on exact requirements
    const autoTimeline = {
      '2025': {
        'Q1': [],
        'Q2': [],
        'Q3': [],
        'Q4': ['WI']
      },
      '2026': {
        'Q1': [],
        'Q2': [],
        'Q3': [],
        'Q4': ['IL', 'OH', 'AZ']
      },
      '2027': {
        'Q1': ['UT', 'IN'],
        'Q2': ['NE'],
        'Q3': ['IA', 'OR', 'TX', 'VA', 'MN'],
        'Q4': ['AL', 'OK', 'AR', 'MS', 'TN']
      },
      '2028': {
        'Q1': ['KS', 'SC', 'MO', 'CO'],
        'Q2': ['KY', 'MD'],
        'Q3': [],
        'Q4': ['WY', 'SD', 'ME', 'WV', 'FL']
      },
      '2029': {
        'Q1': ['ID', 'ND', 'NM', 'GA', 'NY'],
        'Q2': ['VT', 'NV', 'MT', 'RI'],
        'Q3': ['NH', 'AK', 'CT', 'DE', 'DC', 'PA'],
        'Q4': ['LA']
      },
      '2030': {
        'Q1': ['MI', 'MA', 'NJ'],
        'Q2': [],
        'Q3': [],
        'Q4': []
      }
    };
    
    const timeline = {
      auto: {},
      home: {},
      umbrella: {}
    };

    const years = ['2025', '2026', '2027', '2028', '2029', '2030'];
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    
    // Initialize timeline structure
    years.forEach(year => {
      timeline.auto[year] = {};
      timeline.home[year] = {};
      timeline.umbrella[year] = {};
      quarters.forEach(q => {
        timeline.auto[year][q] = [];
        timeline.home[year][q] = [];
        timeline.umbrella[year][q] = [];
      });
    });

    jsonData.forEach(row => {
      const abbr = stateAbbreviations[row.State];
      if (!abbr) return;
      
      totalForms += row['Total Forms'] || 0;
      totalAuto += row['Auto Forms'] || 0;
      totalHome += row['Home/Dwelling'] || 0;
      
      const complexity = row.Complexity || 'Medium';
      complexityCount[complexity] = (complexityCount[complexity]||0)+1;
      
      const filingType = row['Overall Filing Type'] || 'Unknown';
      filingTypes[filingType] = (filingTypes[filingType]||0)+1;
      
      const regulation = row['Rate Regulation'] || 'Unknown';
      regulationTypes[regulation] = (regulationTypes[regulation]||0)+1;
      
      stateMap[abbr] = {
        name: row.State,
        stateRanking: row['State Ranking'] || 0,
        totalForms: row['Total Forms'] || 0,
        autoForms: row['Auto Forms'] || 0,
        homeForms: row['Home/Dwelling'] || 0,
        umbrella: row['Umbrella'] || 0,
        ratingReq: row['Rating Req.'] || 0,
        filingType,
        autoFiling: row['Auto Filing'] || 'N/A',
        homeFiling: row['Home Filing'] || 'N/A',
        rateRegulation: row['Rate Regulation'] || 'N/A',
        pipRequired: row['PIP Required'] || 'N/A',
        pass: executionData[abbr]?.pass || 0,
        fail: executionData[abbr]?.fail || 0,
        noRun: executionData[abbr]?.noRun || 0,
        percentComplete: executionData[abbr]?.percentComplete || 0,
        umUim: row['UM/UIM'] || 'N/A',
        noFault: row['No-Fault'] || 'N/A',
        complexity,
        testingComplexity: row['Testing Complexity'] || 'Medium',
        keyRequirements: row['Key State Requirements'] || 'N/A'
      };
    });

    // Populate Auto timeline with predefined data
    years.forEach(year => {
      quarters.forEach(quarter => {
        const stateCodes = autoTimeline[year][quarter];
        stateCodes.forEach(code => {
          // Add state even if not in stateMap (with default values)
          if (stateMap[code]) {
            timeline.auto[year][quarter].push({
              code: code,
              name: stateMap[code].name,
              complexity: stateMap[code].testingComplexity
            });
          } else {
            // Add with defaults if state not found in Excel data
            timeline.auto[year][quarter].push({
              code: code,
              name: code,
              complexity: 'Medium'
            });
          }
        });
      });
    });

    // For Home and Umbrella, use the testing complexity logic
    Object.entries(stateMap).forEach(([abbr, data]) => {
      const testingComplexity = data.testingComplexity;
      const homeQuarter = testingComplexity === 'Critical' ? 'Q3' : testingComplexity === 'High' ? 'Q3' : testingComplexity === 'Medium' ? 'Q2' : 'Q1';
      const umbrellaQuarter = 'Q2';
      
      const yearIndex = Math.floor((abbr.charCodeAt(0) - 65) / 9) % 6;
      const targetYear = years[yearIndex];
      
      if (data.homeForms > 0) {
        timeline.home[targetYear][homeQuarter].push({
          code: abbr,
          name: data.name,
          complexity: testingComplexity
        });
      }
      
      if (data.umbrella > 0) {
        timeline.umbrella[targetYear][umbrellaQuarter].push({
          code: abbr,
          name: data.name,
          complexity: testingComplexity
        });
      }
    });

    const kpis = {
      totalForms,
      totalAuto,
      totalHome,
      avgFormsPerState: jsonData.length ? Math.round(totalForms / jsonData.length) : 0,
      stateCount: Object.keys(stateMap).length,
      complexityCount,
      filingTypes,
      regulationTypes
    };
    
    return { stateMap, kpis, timeline };
  };

  const getStateColor = useCallback((code) => {
    if (!stateData || !stateData[code]) return '#e5e7eb';
    const testingComplexity = stateData[code].testingComplexity;
    
    // Updated colors: use orange palette for Medium/High
    if (testingComplexity === 'Low') return '#22c55e';      // Green
    if (testingComplexity === 'Medium') return '#f59e0b';   // Orange
    if (testingComplexity === 'High') return '#ea580c';     // Deep Orange
    if (testingComplexity === 'Critical') return '#991b1b'; // Dark Red
    
    return '#f59e0b'; // Default to Medium
  }, [stateData]);

  const getComplexityColor = (complexity) => {
    if (complexity === 'Critical') return 'text-red-700 bg-red-100 border-red-300';
    if (complexity === 'High') return 'text-orange-700 bg-orange-100 border-orange-300';
    if (complexity === 'Medium') return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    return 'text-green-700 bg-green-100 border-green-300';
  };

  const toggleYear = (year) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const toggleQuarter = (year, quarter) => {
    const key = `${year}-${quarter}`;
    setExpandedQuarters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const HomePage = () => (
    <div className="min-h-screen bg-usaa-light flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-usaa-navy mb-2">VAM InsureAnalytics - USAA</h1>
          <p className="text-gray-600">Choose an app to continue</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-usaa-blue" />
              <h2 className="text-xl font-semibold text-usaa-navy">Test Execution Dashboard</h2>
            </div>
            <p className="text-gray-600 mb-4">View test outcomes, code coverage, and sprint analytics.</p>
            <button
              onClick={() => navigate('test')}
              className="px-4 py-2 bg-usaa-blue text-white rounded hover:bg-usaa-navy-700"
            >
              Open
            </button>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileSpreadsheet className="w-6 h-6 text-usaa-blue" />
              <h2 className="text-xl font-semibold text-usaa-navy">State Rollout Analysis</h2>
            </div>
            <p className="text-gray-600 mb-4">Upload filing data to analyze state metrics and insights.</p>
            <button
              onClick={() => navigate('state-rollout')}
              className="px-4 py-2 bg-usaa-blue text-white rounded hover:bg-usaa-navy-700"
            >
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-usaa-navy via-usaa-blue to-usaa-navy flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-6">
            <FileSpreadsheet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Insurelytics
          </h1>
          <p className="text-xl text-white/80 mb-2">
            Upload your Excel file to visualize state filing jurisdiction analysis
          </p>
          <p className="text-sm text-white/70">
            Supports .xlsx and .xls formats
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="border-4 border-dashed border-blue-300 rounded-xl p-12 text-center hover:border-blue-500 transition-all duration-300">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-16 h-16 text-usaa-blue mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                Excel files only (Max 10MB)
              </p>
            </label>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-usaa-light rounded-lg p-4 text-center">
              <TrendingUp className="w-8 h-8 text-usaa-blue mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">Interactive Map</p>
              <p className="text-xs text-gray-600">Hover over states for details</p>
            </div>
            <div className="bg-usaa-light rounded-lg p-4 text-center">
              <Car className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">LOB Timeline</p>
              <p className="text-xs text-gray-600">Track rollouts by quarter</p>
            </div>
            <div className="bg-usaa-light rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-usaa-blue mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">Key Insights</p>
              <p className="text-xs text-gray-600">Automated KPI analysis</p>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );

  const Dashboard = () => {
    const StateDetailPanel = ({ code }) => {
      const d = stateData[code];
      if (!d) return null;
      const pct = d.percentComplete || 0;
      const pctClass = pct > 80 ? 'text-green-600' : (pct >= 60 && pct < 80) ? 'text-amber-600' : 'text-red-600';
      
      return (
        <div className="bg-white rounded-lg shadow-lg p-6 font-sans">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-semibold text-gray-800">{d.name}</h3>
            {selectedState && (
              <button onClick={() => setSelectedState(null)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div><p className="text-sm text-gray-600">Complexity</p><p className="text-base font-semibold text-gray-800">{d.testingComplexity}</p></div>
            <div><p className="text-sm text-gray-600">Filing Type</p><p className="text-sm font-semibold text-gray-800">{d.filingType}</p></div>
            <div><p className="text-sm text-gray-600">Rate Regulation</p><p className="text-sm font-semibold text-gray-800">{d.rateRegulation}</p></div>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-1 font-semibold">Key Requirements</p>
            <p className="text-sm text-gray-800">{d.keyRequirements}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div className="bg-gray-50 rounded p-2"><span className="text-gray-600">PIP:</span> <span className="font-semibold text-gray-800">{d.pipRequired}</span></div>
            <div className="bg-gray-50 rounded p-2"><span className="text-gray-600">UM/UIM:</span> <span className="font-semibold text-gray-800">{d.umUim}</span></div>
            <div className="bg-gray-50 rounded p-2"><span className="text-gray-600">No-Fault:</span> <span className="font-semibold text-gray-800">{d.noFault}</span></div>
          </div>
          
          {/* Execution Summary Section */}
          <div className="pt-3 mt-3 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Execution Summary</h4>
            <div className="text-sm">
              <div className="flex justify-between mb-1 font-medium text-gray-600">
                <span>Pass</span>
                <span>Fail</span>
                <span>No Run</span>
                <span>% Complete</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-green-600">{d.pass || 0}</span>
                <span className="text-red-600">{d.fail || 0}</span>
                <span className="text-gray-600">{d.noRun || 0}</span>
                <span className={pctClass}>{d.percentComplete ? d.percentComplete.toFixed(1) : 0}%</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${d.percentComplete || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* State Metrics Section */}
          <div className="pt-3 mt-3 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">State Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-50 rounded p-2">
                <p className="text-gray-600">State Ranking</p>
                <p className="font-semibold text-gray-800">{d.stateRanking ?? 0}</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-gray-600">Total Forms</p>
                <p className="font-semibold text-gray-800">{d.totalForms ?? 0}</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-gray-600">Auto Forms</p>
                <p className="font-semibold text-gray-800">{d.autoForms ?? 0}</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-gray-600">Home/Dwelling</p>
                <p className="font-semibold text-gray-800">{d.homeForms ?? 0}</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-gray-600">Umbrella</p>
                <p className="font-semibold text-gray-800">{d.umbrella ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const HorizontalTreeTimeline = () => {
      if (!timelineData || !selectedLOB) return null;
      
      const lobData = timelineData[selectedLOB];
      if (!lobData) return null;

      const years = ['2025', '2026', '2027', '2028', '2029', '2030'];
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

      // Handler to toggle year selection
      const handleYearClick = (year) => {
        // Clear any existing hover/details when changing year selection
        setHoveredState(null);
        setSelectedState(null);

        if (selectedYear === year) {
          setSelectedYear(null); // Deselect if already selected
        } else {
          setSelectedYear(year); // Select new year
        }
      };

      return (
        <div className="bg-white rounded-lg shadow-md p-3 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800 capitalize flex items-center gap-2">
              <span>{selectedLOB} LOB Timeline</span>
              <span className="text-xs text-gray-500 italic">Hover over or click a state to see details</span>
            </h3>
            {/* Complexity Legend */}
            {selectedLOB === 'auto' ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-gray-600">State Roll Out Complexity</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{backgroundColor: '#22c55e'}}></div>
                  <span>Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{backgroundColor: '#f59e0b'}}></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{backgroundColor: '#991b1b'}}></div>
                  <span>High</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-gray-600">Complexity:</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{backgroundColor: '#22c55e'}}></div>
                  <span>Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{backgroundColor: '#f59e0b'}}></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{backgroundColor: '#991b1b'}}></div>
                  <span>High</span>
                </div>
                <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{backgroundColor: '#991b1b'}}></div>
                  <span>Critical</span>
                </div>
              </div>
            )}
          </div>

          {/* Horizontal Timeline with Quarters */}
          <div className="relative pt-2 pb-4">
            {/* Timeline Bar */}
            <div className="absolute top-6 left-8 right-8 h-0.5 bg-blue-300"></div>
            
            {/* Years and Quarters */}
            <div className="flex justify-between relative px-6">
              {years.map((year, yearIndex) => {
                const yearData = lobData[year];
                const totalStatesInYear = quarters.reduce((sum, q) => 
                  sum + (yearData[q]?.length || 0), 0
                );

                return (
                  <div key={year} className="flex flex-col items-center flex-1 relative">
                    {/* Year Label */}
                    <div className="text-sm font-bold text-gray-800 mb-1">{year}</div>
                    
                    {/* Year Marker - CLICKABLE */}
                    <button
                      onClick={() => handleYearClick(year)}
                      disabled={totalStatesInYear === 0}
                      className={`w-3 h-3 rounded-full z-10 mb-1 shadow-sm transition-all ${
                        totalStatesInYear === 0 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : selectedYear === year
                            ? 'bg-yellow-500 ring-2 ring-yellow-300'
                            : 'bg-usaa-blue hover:bg-usaa-navy-700 cursor-pointer'
                      }`}
                      title={totalStatesInYear === 0 ? 'No states' : 'Click to view quarters'}
                    ></button>
                    
                    {/* State Count */}
                    <div className="text-[10px] text-gray-500">
                      {totalStatesInYear} {totalStatesInYear === 1 ? 'state' : 'states'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quarter Details Below - Shows when year is selected */}
            {selectedYear && (
              <div className="mt-4 border-t border-gray-300 pt-3">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-800 text-xs">{selectedYear} - Quarters Breakdown</h4>
                    <button
                      onClick={() => {
                        setSelectedYear(null);
                        setHoveredState(null);
                        setSelectedState(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 text-xs font-medium"
                    >
                      Close ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {quarters.map(quarter => {
                      const states = lobData[selectedYear][quarter] || [];
                      
                      return (
                        <div key={quarter} className={`border rounded p-1.5 ${
                          states.length === 0 ? 'border-gray-300 bg-white' : 'border-gray-400 bg-white'
                        }`}>
                          <div className="font-semibold text-gray-800 text-center mb-1 text-xs bg-gray-100 py-0.5 rounded">
                            {quarter}
                          </div>
                          {states.length === 0 ? (
                            <div className="text-center text-gray-400 text-[10px] py-1">No states</div>
                          ) : (
                            <div className="flex flex-wrap gap-0.5 justify-center">
                              {states.map((state, idx) => {
                                const bgColors = {
                                  'Low': '#22c55e',
                                  'Medium': '#f59e0b',
                                  'High': '#ea580c',
                                  'Critical': '#991b1b'
                                };
                                return (
                                  <span
                                    key={idx}
                                    className="px-1 py-0.5 text-white font-semibold rounded text-[10px] cursor-pointer hover:opacity-80"
                                    style={{ backgroundColor: bgColors[state.complexity] || '#6b7280' }}
                                    title={`${state.name} - ${state.complexity}`}
                                  >
                                    {state.code}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };

    const DataVisualizationCharts = () => {
      // Prepare data for charts
      const statesArray = Object.entries(stateData).map(([code, data]) => ({
        code,
        ...data
      }));

      // Sort states by total forms for top 10
      const top10States = [...statesArray]
        .sort((a, b) => b.totalForms - a.totalForms)
        .slice(0, 10);

      // Testing Complexity distribution
      const complexityData = statesArray.reduce((acc, state) => {
        acc[state.testingComplexity] = (acc[state.testingComplexity] || 0) + 1;
        return acc;
      }, {});

      // Filing Types distribution
      const filingTypeData = statesArray.reduce((acc, state) => {
        acc[state.filingType] = (acc[state.filingType] || 0) + 1;
        return acc;
      }, {});

      // Rate Regulation distribution
      const regulationData = statesArray.reduce((acc, state) => {
        acc[state.rateRegulation] = (acc[state.rateRegulation] || 0) + 1;
        return acc;
      }, {});

      // Product forms data
      const productData = [
        { name: 'Auto', value: kpiData.totalAuto, color: '#3b82f6' },
        { name: 'Home', value: kpiData.totalHome, color: '#ec4899' },
        { name: 'Umbrella', value: Object.values(stateData).reduce((sum, s) => sum + s.umbrella, 0), color: '#8b5cf6' }
      ];

      return (
        <div className="space-y-4">
          {/* Row 1: Product Forms + Testing Complexity + Filing Types */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Bar Chart: Forms by Product Type */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Forms by Product Type</h3>
              <div className="h-48">
                <div className="flex items-end justify-around h-full gap-2 pb-6">
                  {productData.map((product) => {
                    const maxValue = Math.max(...productData.map(p => p.value));
                    const heightPercent = (product.value / maxValue) * 100;
                    return (
                      <div key={product.name} className="flex flex-col items-center flex-1">
                        <div className="text-xs font-semibold mb-1">{product.value}</div>
                        <div
                          className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
                          style={{
                            backgroundColor: product.color,
                            height: `${heightPercent}%`,
                            minHeight: '20px'
                          }}
                        ></div>
                        <div className="text-xs font-medium mt-1">{product.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stacked Bar: Testing Complexity Distribution */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Testing Complexity Distribution</h3>
              <div className="space-y-2">
                {Object.entries(complexityData).map(([level, count]) => {
                  const colors = {
                    'Low': '#7fb069',
                    'Medium': '#b8985f',
                    'High': '#8b4513',
                    'Critical': '#e74c3c'
                  };
                  const percentage = (count / statesArray.length) * 100;
                  return (
                    <div key={level}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{level}</span>
                        <span className="text-gray-600">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-5">
                        <div
                          className="h-5 rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-bold"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: colors[level],
                            minWidth: count > 0 ? '25px' : '0'
                          }}
                        >
                          {count}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pie Chart: Filing Types */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Filing Type Distribution</h3>
              <div className="space-y-1.5">
                {Object.entries(filingTypeData).map(([type, count], index) => {
                  const colors = ['#3b82f6', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981'];
                  const percentage = (count / statesArray.length) * 100;
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded flex-shrink-0"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium truncate">{type}</span>
                          <span className="text-gray-600 ml-2">{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Top 10 States + Histogram */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Line Chart: Top 10 States by Total Forms */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Top 10 States by Total Forms</h3>
              <div className="h-52 relative">
                <svg viewBox="0 0 800 200" className="w-full h-full">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="50"
                      y1={30 + i * 35}
                      x2="750"
                      y2={30 + i * 35}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Line chart */}
                  {top10States.map((state, index) => {
                    if (index === top10States.length - 1) return null;
                    const x1 = 100 + index * 70;
                    const x2 = 100 + (index + 1) * 70;
                    const maxForms = top10States[0].totalForms;
                    const y1 = 170 - (state.totalForms / maxForms) * 120;
                    const y2 = 170 - (top10States[index + 1].totalForms / maxForms) * 120;
                    
                    return (
                      <g key={state.code}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#3b82f6"
                          strokeWidth="2"
                        />
                        <circle cx={x1} cy={y1} r="4" fill="#3b82f6" />
                      </g>
                    );
                  })}
                  
                  {/* Last point */}
                  {top10States.length > 0 && (
                    <circle
                      cx={100 + (top10States.length - 1) * 70}
                      cy={170 - (top10States[top10States.length - 1].totalForms / top10States[0].totalForms) * 120}
                      r="4"
                      fill="#3b82f6"
                    />
                  )}
                  
                  {/* Labels */}
                  {top10States.map((state, index) => {
                    const x = 100 + index * 70;
                    const maxForms = top10States[0].totalForms;
                    const y = 170 - (state.totalForms / maxForms) * 120;
                    return (
                      <g key={state.code}>
                        <text x={x} y="190" textAnchor="middle" className="text-xs font-medium">{state.code}</text>
                        <text x={x} y={y - 8} textAnchor="middle" className="text-xs font-bold" fill="#3b82f6">{state.totalForms}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Histogram: Distribution of Total Forms */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Total Forms Distribution</h3>
              <div className="h-52">
                {(() => {
                  const bins = [
                    { range: '0-100', min: 0, max: 100, color: '#dbeafe' },
                    { range: '100-150', min: 100, max: 150, color: '#93c5fd' },
                    { range: '150-200', min: 150, max: 200, color: '#60a5fa' },
                    { range: '200-300', min: 200, max: 300, color: '#3b82f6' },
                    { range: '300+', min: 300, max: Infinity, color: '#1e40af' }
                  ];
                  
                  const histogram = bins.map(bin => ({
                    ...bin,
                    count: statesArray.filter(s => s.totalForms >= bin.min && s.totalForms < bin.max).length
                  }));
                  
                  const maxCount = Math.max(...histogram.map(h => h.count));
                  
                  return (
                    <div className="flex items-end justify-around h-full gap-2 pb-6">
                      {histogram.map((bin) => {
                        const heightPercent = maxCount > 0 ? (bin.count / maxCount) * 100 : 0;
                        return (
                          <div key={bin.range} className="flex flex-col items-center flex-1">
                            <div className="text-xs font-semibold mb-1">{bin.count}</div>
                            <div
                              className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
                              style={{
                                backgroundColor: bin.color,
                                height: `${heightPercent}%`,
                                minHeight: bin.count > 0 ? '15px' : '5px'
                              }}
                            ></div>
                            <div className="text-xs font-medium mt-1 text-center">{bin.range}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Row 3: Bubble Chart (Full Width) */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Auto Forms vs Home Forms (Bubble Size = Total Forms)</h3>
            <div className="h-64 relative bg-gray-50 rounded-lg p-2">
              <svg viewBox="0 0 600 250" className="w-full h-full">
                {/* Axes */}
                <line x1="40" y1="220" x2="560" y2="220" stroke="#374151" strokeWidth="2" />
                <line x1="40" y1="30" x2="40" y2="220" stroke="#374151" strokeWidth="2" />
                
                {/* Axis labels */}
                <text x="300" y="245" textAnchor="middle" className="text-xs font-semibold">Auto Forms</text>
                <text x="15" y="125" textAnchor="middle" className="text-xs font-semibold" transform="rotate(-90 15 125)">Home Forms</text>
                
                {/* Bubbles */}
                {statesArray.slice(0, 30).map((state) => {
                  const maxAuto = Math.max(...statesArray.map(s => s.autoForms));
                  const maxHome = Math.max(...statesArray.map(s => s.homeForms));
                  const maxTotal = Math.max(...statesArray.map(s => s.totalForms));
                  
                  const x = 40 + (state.autoForms / maxAuto) * 520;
                  const y = 220 - (state.homeForms / maxHome) * 190;
                  const radius = 4 + (state.totalForms / maxTotal) * 15;
                  
                  const complexityColors = {
                    'Low': '#7fb069',
                    'Medium': '#b8985f',
                    'High': '#8b4513',
                    'Critical': '#e74c3c'
                  };
                  
                  return (
                    <g key={state.code}>
                      <circle
                        cx={x}
                        cy={y}
                        r={radius}
                        fill={complexityColors[state.testingComplexity]}
                        opacity="0.6"
                        className="hover:opacity-100 transition-opacity"
                      />
                      <text
                        x={x}
                        y={y + 3}
                        textAnchor="middle"
                        className="text-xs font-bold pointer-events-none"
                        fill="#fff"
                      >
                        {state.code}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Row 4: Rate Regulation Summary */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Rate Regulation Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(regulationData).map(([type, count]) => (
                <div key={type} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-usaa-blue">{count}</div>
                  <div className="text-xs font-medium text-gray-700 mt-1 truncate" title={type}>{type}</div>
                  <div className="text-xs text-gray-500">{((count / statesArray.length) * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };

    // Memoized US map component with DIM EFFECT
const USMap = React.memo(({ usTopo, stateAbbreviations, selectedYearStateSet, hoveredState, stateData, getStateColor, setHoverThrottled, setSelectedState }) => {
  if (!usTopo) {
    return <div className="h-64 flex items-center justify-center text-sm text-gray-500">Loading US map...</div>;
  }
  return (
    <ComposableMap projection="geoAlbersUsa">
      <Geographies geography={usTopo}>
        {({ geographies }) => (
          <>
            {geographies.map((geo) => {
              const name = geo.properties.name;
              const stateCode = stateAbbreviations[name];
              if (!stateCode) return null;
              const isInSelectedYear = selectedYearStateSet?.has(stateCode);
              const isHovered = hoveredState === stateCode;
              
              // Get the base color from complexity
              let fillColor = getStateColor(stateCode);
              let opacity = 1;
              let strokeWidth = 1;
              let strokeColor = '#fff';
              let pointerEvents = 'auto';
              let filterValue = 'none';
              
              // Apply DIM EFFECT when year is selected
              if (selectedYearStateSet && selectedYearStateSet.size > 0) {
                if (!isInSelectedYear) {
                  // Blur and dim non-selected states; disable interaction
                  opacity = 0.35; // was 10; keep visible but dimmed
                  pointerEvents = 'none';
                  filterValue = 'blur(1.2px) grayscale(50%)';
                } else {
                  // Highlight selected states with golden border
                  strokeWidth = 2;
                  strokeColor = '#fbbf24';
                }
              }
              
              // Hover effect (overrides selection)
              if (isHovered) {
                strokeWidth = 2.5;
                strokeColor = '#1e40af';
                opacity = 1; // fix incorrect 10 -> 1
                filterValue = 'none';
              }
              
              const centroid = geoCentroid(geo);
              const labelFill = isInSelectedYear || isHovered
                ? '#1f2937'
                : (['High', 'Critical'].includes(stateData?.[stateCode]?.testingComplexity)
                    ? '#fff'
                    : '#1f2937');
                    
              return (
                <React.Fragment key={geo.rsmKey}>
                  <Geography
                    geography={geo}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    onMouseEnter={() => {
                      cancelLeave();
                      if (hoveredRef.current !== stateCode) setHoverThrottled(stateCode);
                    }}
                    onMouseLeave={() => {
                      cancelLeave();
                      leaveTimeoutRef.current = setTimeout(() => {
                        // Clear hover and selection if pointer is not on any state
                        if (hoveredRef.current === stateCode) {
                          setHoverThrottled(null);
                          setSelectedState(null);
                        }
                      }, 80);
                    }}
                    onClick={() => {
                      if (!selectedYearStateSet || isInSelectedYear) {
                        setSelectedState(stateCode);
                      }
                    }}
                    style={{
                      default: { 
                        outline: 'none',
                        opacity: opacity,
                        pointerEvents: pointerEvents,
                        filter: filterValue,
                        cursor: pointerEvents === 'none' ? 'default' : 'pointer',
                        transition: 'all 0.3s ease-in-out'
                      },
                      hover: { 
                        outline: 'none',
                        opacity: 1,
                        pointerEvents: pointerEvents,
                        filter: filterValue,
                        cursor: pointerEvents === 'none' ? 'default' : 'pointer',
                        transition: 'all 0.2s ease-in-out'
                      },
                      pressed: { outline: 'none' },
                    }}
                  />
                  <Marker coordinates={centroid}>
                    <text
                      textAnchor="middle"
                      className="pointer-events-none text-xs font-bold"
                      fill={labelFill}
                      style={{
                        opacity: opacity,
                        transition: 'opacity 0.3s ease-in-out'
                      }}
                    >
                      {stateCode}
                    </text>
                  </Marker>
                </React.Fragment>
              );
            })}
          </>
        )}
      </Geographies>
    </ComposableMap>
  );
});        

    const OverviewContent = () => {
      const selectedYearStateSet = useMemo(() => {
        if (!selectedYear || !timelineData || !selectedLOB) return null;
        const yearData = timelineData[selectedLOB][selectedYear];
        if (!yearData) return null;
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        const codes = new Set();
        quarters.forEach((q) => yearData[q]?.forEach((s) => codes.add(s.code)));
        return codes;
      }, [selectedYear, timelineData, selectedLOB]);

      // Memoized per-state renderer to avoid unnecessary re-renders
      const GeoState = React.memo(
        ({ geo, stateCode, centroid, fill, labelFill, onEnter, onLeave, onClick }) => (
          <>
            <Geography
              geography={geo}
              fill={fill}
              stroke="#fff"
              strokeWidth={1}
              onMouseEnter={onEnter}
              onMouseLeave={onLeave}
              onClick={onClick}
              style={{
                default: { outline: 'none' },
                hover: { outline: 'none' },
                pressed: { outline: 'none' },
              }}
            />
            <Marker coordinates={centroid}>
              <text
                textAnchor="middle"
                className="pointer-events-none text-xs font-bold"
                fill={labelFill}
              >
                {stateCode}
              </text>
            </Marker>
          </>
        ),
        (prev, next) =>
          prev.fill === next.fill &&
          prev.labelFill === next.labelFill &&
          prev.stateCode === next.stateCode &&
          prev.centroid[0] === next.centroid[0] &&
          prev.centroid[1] === next.centroid[1]
      );

      return (
      <>
        {/* KPI Cards - Only show in Overview */}
        {selectedLOB === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="text-gray-500 text-sm font-semibold mb-1">Total Forms</div>
              <div className="text-3xl font-bold text-gray-800">{kpiData.totalForms}</div>
              <div className="text-green-600 text-sm mt-1">Across {kpiData.stateCount} states</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="text-gray-500 text-sm font-semibold mb-1">Auto Forms</div>
              <div className="text-3xl font-bold text-gray-800">{kpiData.totalAuto}</div>
              <div className="text-gray-600 text-sm mt-1">{((kpiData.totalAuto/kpiData.totalForms)*100).toFixed(1)}% of total</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-500">
              <div className="text-gray-500 text-sm font-semibold mb-1">Home Forms</div>
              <div className="text-3xl font-bold text-gray-800">{kpiData.totalHome}</div>
              <div className="text-gray-600 text-sm mt-1">{((kpiData.totalHome/kpiData.totalForms)*100).toFixed(1)}% of total</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
              <div className="text-gray-500 text-sm font-semibold mb-1">Avg per State</div>
              <div className="text-3xl font-bold text-gray-800">{kpiData.avgFormsPerState}</div>
              <div className="text-gray-600 text-sm mt-1">Forms filed</div>
            </div>
          </div>
        )}

        {/* Conditional Content based on selectedLOB */}
        {selectedLOB === 'overview' ? (
          <DataVisualizationCharts />
        ) : (
          /* Map view for Auto, Home, Umbrella */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section - 2/3 width */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
              <div className="relative bg-gray-50 rounded-lg p-4">
                <USMap
                  usTopo={usTopo}
                  stateAbbreviations={stateAbbreviations}
                  selectedYearStateSet={selectedYearStateSet}
                  hoveredState={hoveredState}
                  stateData={stateData}
                  getStateColor={getStateColor}
                  setHoverThrottled={setHoverThrottled}
                  setSelectedState={setSelectedState}
                />
                
                {/* Legend and Title: Auto-specific positioning; others remain centered below */}
                {selectedLOB === 'auto' ? (
                  <>
                    {/* Title for Auto Map */}
                    <div className="absolute top-2 left-4 text-sm font-bold text-gray-800">
                      Personal Auto - State Rollout Testing Complexity
                    </div>
                    {/* Legend moved to top-right */}
                    <div className="absolute top-2 right-4 flex items-center justify-end gap-4 text-sm bg-white/80 rounded-md px-2 py-1 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{backgroundColor: '#22c55e'}}></div>
                        <span>Low</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{backgroundColor: '#f59e0b'}}></div>
                        <span>Medium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{backgroundColor: '#ea580c'}}></div>
                        <span>High</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{backgroundColor: '#991b1b'}}></div>
                        <span>Critical</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 flex items-center justify-center gap-4 text-sm flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#22c55e'}}></div>
                      <span>Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#f59e0b'}}></div>
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#ea580c'}}></div>
                      <span>High</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: '#991b1b'}}></div>
                      <span>Critical</span>
                    </div>
                    {selectedYear && (
                      <div className="flex items-center gap-2 ml-4 pl-4 border-l-2 border-gray-300">
                        <div className="w-4 h-4 rounded" style={{backgroundColor: '#fbbf24'}}></div>
                        <span className="font-semibold">Selected Year ({selectedYear})</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - State Details */}
            <div className="space-y-6">
              {(hoveredState || selectedState) && stateData[hoveredState || selectedState] ? (
                <StateDetailPanel code={hoveredState || selectedState} />
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <p className="text-gray-500 text-center italic">Hover over or click a state to see details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
        {/* Left Navigation Pane */}
        <div className="w-48 bg-usaa-navy text-white p-4 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1">Dashboard</h2>
            <p className="text-xs text-gray-400 truncate" title={fileName}>{fileName}</p>
          </div>

          <button
            onClick={() => navigate('home')}
            className="w-full px-3 py-2 mb-3 bg-usaa-blue hover:bg-usaa-navy-700 rounded-lg font-medium text-sm"
          >
            Back to Home
          </button>

          <nav className="flex-1">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Navigation</h3>
            
            <button
              onClick={() => {
                setSelectedLOB('overview');
                setExpandedYears({});
                setExpandedQuarters({});
                setSelectedYear(null);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-2 transition-colors ${
                selectedLOB === 'overview' ? 'bg-usaa-blue' : 'hover:bg-usaa-navy-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="font-medium text-sm">Overview</span>
            </button>

            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 mt-4">Lines of Business</h3>
            
            <button
              onClick={() => {
                setSelectedLOB('auto');
                setExpandedYears({});
                setExpandedQuarters({});
                setSelectedYear(null);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-2 transition-colors ${
                selectedLOB === 'auto' ? 'bg-usaa-blue' : 'hover:bg-usaa-navy-700'
              }`}
            >
              <Car className="w-4 h-4" />
              <span className="font-medium text-sm">Auto</span>
            </button>

            <button
              onClick={() => {
                setSelectedLOB('home');
                setExpandedYears({});
                setExpandedQuarters({});
                setSelectedYear(null);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-2 transition-colors ${
                selectedLOB === 'home' ? 'bg-usaa-blue' : 'hover:bg-usaa-navy-700'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium text-sm">Dwelling</span>
            </button>

            <button
              onClick={() => {
                setSelectedLOB('umbrella');
                setExpandedYears({});
                setExpandedQuarters({});
                setSelectedYear(null);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-2 transition-colors ${
                selectedLOB === 'umbrella' ? 'bg-usaa-blue' : 'hover:bg-usaa-navy-700'
              }`}
            >
              <Umbrella className="w-4 h-4" />
              <span className="font-medium text-sm">Umbrella</span>
            </button>
          </nav>

          <button
            onClick={() => {
              setFileUploaded(false);
              setStateData(null);
              setFileName('');
              setSelectedLOB(null);
              setSelectedYear(null);
            }}
            className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium text-sm transition-colors"
          >
            Upload New
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Horizontal Tree Timeline at Top - only for LOB views */}
          {selectedLOB && selectedLOB !== 'overview' && <HorizontalTreeTimeline />}
          
          {/* Overview Content Below */}
          <OverviewContent />
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (fileUploaded) {
      document.body.classList.add('dashboard-mode');
    } else {
      document.body.classList.remove('dashboard-mode');
    }
  }, [fileUploaded]);

  if (appMode === 'home') return <HomePage />;
  if (appMode === 'test') return <TestDashboardWrapper onBack={() => navigate('home')} />;
  if (!fileUploaded) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end mb-6">
            <button onClick={() => navigate('home')} className="px-3 py-2 bg-usaa-blue text-white rounded hover:bg-usaa-navy-700">Back to Home</button>
          </div>
        </div>
        <LandingPageSR onUpload={handleFileUpload} />
      </div>
    );
  }
  return <Dashboard />;
};

export default InsuranceAnalyticsPlatform;