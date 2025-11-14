import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import SprintAnalyticsDashboard from './SprintAnalyticsDashboard.jsx';
import CodeCoverageDashboard from './CodeCoverageDashboard.jsx';
import TestDataRepository from './TestDataRepository.jsx';

const TestResultDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState('Test Outcome Dashboard');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    account: 'GSI-4',
    project: 'DCOD',
    environment: '2 ITEMS SELECTED',
    tagName: 'APR',
    reportCriteria: 'By Daterange',
    startDate: '2024-01-01',
    endDate: '2024-04-15'
  });

  // Mock data
  const [testData, setTestData] = useState([
    {
      id: 1,
      featureName: 'APR_Package_Smoke',
      scenarioName: 'APR_Package_Smoke',
      environment: 'QA03',
      tags: 'APR_Package_SmokeTest',
      passedCount: 1,
      failedCount: 0,
      totalCount: 1
    },
    {
      id: 2,
      featureName: 'PackageReg_TCID_200945_Functional',
      scenarioName: 'PackageReg_TCID_200945_Functional',
      environment: 'QA03',
      tags: 'APR, PackageReg, WI200945, Functional',
      passedCount: 0,
      failedCount: 8,
      totalCount: 8
    },
    {
      id: 3,
      featureName: 'PackageReg_TCID_194787',
      scenarioName: 'PackageReg_TCID_194787',
      environment: 'QA02',
      tags: 'APR, Regression, WI194787, PackageReg, 01220204Regression',
      passedCount: 1,
      failedCount: 0,
      totalCount: 1
    },
    {
      id: 4,
      featureName: 'PackageReg_TCID_197836',
      scenarioName: 'PackageReg_TCID_197836',
      environment: 'QA02',
      tags: 'APR, Regression, WI194787, PackageReg, 01220204Regression',
      passedCount: 1,
      failedCount: 0,
      totalCount: 1
    },
    {
      id: 5,
      featureName: 'PackageReg_TCID_198052',
      scenarioName: 'PackageReg_TCID_198052',
      environment: 'QA02',
      tags: 'APR, Regression, WI194787, PackageReg, 01220204Regression',
      passedCount: 1,
      failedCount: 0,
      totalCount: 1
    },
    {
      id: 6,
      featureName: 'PackageReg_TCID_200638',
      scenarioName: 'PackageReg_TCID_200638',
      environment: 'QA02',
      tags: 'APR, Regression, WI194787, PackageReg, 01220204Regression',
      passedCount: 1,
      failedCount: 0,
      totalCount: 1
    }
  ]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = testData.reduce((sum, item) => sum + item.totalCount, 0);
    const passed = testData.reduce((sum, item) => sum + item.passedCount, 0);
    const failed = testData.reduce((sum, item) => sum + item.failedCount, 0);
    const unique = testData.length;
    
    return { total, passed, failed, unique };
  }, [testData]);

  // Chart data
  const chartData = [
    { name: 'Passed', value: stats.passed, color: '#4CAF50' },
    { name: 'Failed', value: stats.failed, color: '#f44336' }
  ];

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchKeyword) return testData;
    
    return testData.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchKeyword.toLowerCase())
      )
    );
  }, [testData, searchKeyword]);

  // Pagination
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    console.log('Searching with filters:', filters);
    alert('Search executed with current filters!');
  };

  const handleCancel = () => {
    setFilters({
      account: 'GSI-4',
      project: 'DCOD',
      environment: '2 ITEMS SELECTED',
      tagName: 'APR',
      reportCriteria: 'By Daterange',
      startDate: '2024-01-01',
      endDate: '2024-04-15'
    });
    setSearchKeyword('');
    alert('Filters reset to default values!');
  };

  const handleExport = () => {
    const csvContent = [
      ['Feature Name', 'Scenario Name', 'Environment', 'Tags', 'Passed', 'Failed', 'Total'],
      ...filteredData.map(item => [
        item.featureName,
        item.scenarioName,
        item.environment,
        item.tags,
        item.passedCount,
        item.failedCount,
        item.totalCount
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div style={styles.container}>
      {/* Tabs */}
      <div style={styles.tabs}>
        {['Test Outcome Dashboard', 'Sprint Analytic Dashboard', 'Code Coverage', 'Test Data'].map(tab => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Sprint Analytic Dashboard' ? (
        <div style={styles.content}>
          <SprintAnalyticsDashboard />
        </div>
      ) : activeTab === 'Code Coverage' ? (
        <div style={styles.content}>
          <CodeCoverageDashboard />
        </div>
      ) : activeTab === 'Test Data' ? (
        <div style={styles.content}>
          <TestDataRepository />
        </div>
      ) : (
        <>
          <div style={styles.content}>
            <div style={styles.filters}>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Account</label>
                <select 
                  style={styles.select} 
                  value={filters.account}
                  onChange={(e) => handleFilterChange('account', e.target.value)}
                >
                  <option>GSI-4</option>
                  <option>GSI-3</option>
                  <option>GSI-2</option>
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>Project Name</label>
                <select 
                  style={styles.select}
                  value={filters.project}
                  onChange={(e) => handleFilterChange('project', e.target.value)}
                >
                  <option>DCOD</option>
                  <option>Project A</option>
                  <option>Project B</option>
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>Environment Name</label>
                <select 
                  style={styles.select}
                  value={filters.environment}
                  onChange={(e) => handleFilterChange('environment', e.target.value)}
                >
                  <option>2 ITEMS SELECTED</option>
                  <option>QA01</option>
                  <option>QA02</option>
                  <option>QA03</option>
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>Tag Name</label>
                <select 
                  style={styles.select}
                  value={filters.tagName}
                  onChange={(e) => handleFilterChange('tagName', e.target.value)}
                >
                  <option>APR</option>
                  <option>Regression</option>
                  <option>Smoke</option>
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>Report Criteria</label>
                <select 
                  style={styles.select}
                  value={filters.reportCriteria}
                  onChange={(e) => handleFilterChange('reportCriteria', e.target.value)}
                >
                  <option>By Daterange</option>
                  <option>By Sprint</option>
                  <option>By Release</option>
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>Start Date</label>
                <input 
                  type="date" 
                  style={styles.input}
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>End Date</label>
                <input 
                  type="date" 
                  style={styles.input}
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button style={styles.btnSearch} onClick={handleSearch}>
                <span>🔍</span> Search
              </button>
              <button style={styles.btnCancel} onClick={handleCancel}>
                <span>⊗</span> Cancel
              </button>
            </div>

            <div style={styles.dashboardContent}>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.statsContainer}>
                <div style={{ ...styles.statBox, borderLeftColor: '#4CAF50' }}>
                  <div style={styles.statLabel}>
                    <span style={{ ...styles.colorIndicator, backgroundColor: '#4CAF50' }}></span>
                    Passed
                  </div>
                  <div style={styles.statValue}>{stats.passed}</div>
                </div>

                <div style={{ ...styles.statBox, borderLeftColor: '#f44336' }}>
                  <div style={styles.statLabel}>
                    <span style={{ ...styles.colorIndicator, backgroundColor: '#f44336' }}></span>
                    Failed
                  </div>
                  <div style={styles.statValue}>{stats.failed}</div>
                </div>

                <div style={{ ...styles.statBox, borderLeftColor: '#2196F3' }}>
                  <div style={styles.statLabel}>
                    <span style={{ ...styles.colorIndicator, backgroundColor: '#2196F3' }}></span>
                    Unique
                  </div>
                  <div style={styles.statValue}>{stats.unique}</div>
                </div>

                <div style={{ ...styles.statBox, borderLeftColor: '#333' }}>
                  <div style={styles.statLabel}>
                    <span style={{ ...styles.colorIndicator, backgroundColor: '#333' }}></span>
                    Total
                  </div>
                  <div style={styles.statValue}>{stats.total}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.exportSection}>
            <button style={styles.exportBtn} onClick={handleExport}>
              📤 Export
            </button>
            <input
              type="text"
              style={styles.searchBox}
              placeholder="🔍 Search keyword"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          <table style={styles.dataTable}>
            <thead>
              <tr>
                <th style={styles.th}></th>
                <th style={styles.th}>Feature Name</th>
                <th style={styles.th}>Scenario Name</th>
                <th style={styles.th}>Environment</th>
                <th style={styles.th}>Tags</th>
                <th style={styles.th}>Passed Count</th>
                <th style={styles.th}>Failed Count</th>
                <th style={styles.th}>Total Count</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <React.Fragment key={item.id}>
                  <tr style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.td}>
                      <button
                        style={styles.expandBtn}
                        onClick={() => toggleRow(item.id)}
                      >
                        {expandedRows.has(item.id) ? '−' : '+'}
                      </button>
                    </td>
                    <td style={styles.td}>{item.featureName}</td>
                    <td style={styles.td}>{item.scenarioName}</td>
                    <td style={styles.td}>{item.environment}</td>
                    <td style={styles.td}>{item.tags}</td>
                    <td style={styles.td}>{item.passedCount}</td>
                    <td style={styles.td}>{item.failedCount}</td>
                    <td style={styles.td}>{item.totalCount}</td>
                  </tr>
                  {expandedRows.has(item.id) && (
                    <tr>
                      <td colSpan="8" style={styles.expandedContent}>
                        <div style={{ padding: '15px', backgroundColor: '#f0f8ff' }}>
                          <strong>Detailed Information:</strong>
                          <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
                            <li>Test ID: {item.id}</li>
                            <li>Success Rate: {((item.passedCount / item.totalCount) * 100).toFixed(1)}%</li>
                            <li>Status: {item.failedCount > 0 ? '❌ Has Failures' : '✅ All Passed'}</li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div style={styles.pagination}>
            <span style={styles.paginationInfo}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </span>
            <button
              style={styles.paginationBtn}
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              «
            </button>
            <button
              style={styles.paginationBtn}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                style={{
                  ...styles.paginationBtn,
                  ...(currentPage === i + 1 ? styles.paginationBtnActive : {})
                }}
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              style={styles.paginationBtn}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
            <button
              style={styles.paginationBtn}
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  header: {
    background: 'linear-gradient(90deg, #002b5c 0%, #1f4e79 100%)',
    color: 'white',
    padding: '15px 30px',
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    letterSpacing: '1px'
  },
  navBar: {
    background: 'linear-gradient(135deg, #002b5c 0%, #1f4e79 100%)',
    padding: '12px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navLeft: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '500'
  },
  navRight: {
    display: 'flex',
    gap: '20px'
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '14px'
  },
  tabs: {
    backgroundColor: '#e8e8e8',
    padding: '0 30px',
    display: 'flex',
    gap: '5px',
    borderBottom: '2px solid #ccc'
  },
  tab: {
    padding: '12px 20px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '14px',
    color: '#555',
    borderTopLeftRadius: '5px',
    borderTopRightRadius: '5px'
  },
  tabActive: {
    backgroundColor: '#c8a500',
    color: 'white',
    fontWeight: '500'
  },
  content: {
    padding: '20px 30px',
    backgroundColor: 'white'
  },
  filters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    marginBottom: '20px'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333'
  },
  select: {
    padding: '8px 10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '13px',
    backgroundColor: 'white'
  },
  input: {
    padding: '8px 10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '13px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  btnSearch: {
    padding: '8px 20px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    backgroundColor: '#1f4e79',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  btnCancel: {
    padding: '8px 20px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    backgroundColor: 'white',
    color: '#1f4e79',
    border: '2px solid #1f4e79',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  dashboardContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '20px',
    marginTop: '20px',
    alignItems: 'start'
  },
  chartContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px'
  },
  statBox: {
    padding: '15px',
    borderRadius: '8px',
    borderLeft: '4px solid',
    backgroundColor: '#f9f9f9'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '5px'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333'
  },
  colorIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '2px'
  },
  exportSection: {
    backgroundColor: '#fff9d6',
    padding: '15px 30px',
    margin: '20px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  exportBtn: {
    backgroundColor: '#c8a500',
    color: 'white',
    padding: '8px 20px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
  searchBox: {
    padding: '8px 15px',
    border: '1px solid #ccc',
    borderRadius: '20px',
    width: '300px',
    fontSize: '13px'
  },
  dataTable: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  th: {
    backgroundColor: '#002b5c',
    color: 'white',
    padding: '12px 15px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600'
  },
  td: {
    padding: '12px 15px',
    fontSize: '12px',
    color: '#333',
    borderBottom: '1px solid #e0e0e0'
  },
  trEven: {
    backgroundColor: '#f9f9f9'
  },
  trOdd: {
    backgroundColor: 'white'
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#666',
    padding: '0 5px'
  },
  expandedContent: {
    backgroundColor: '#f6f8fb',
    borderBottom: '1px solid #e0e0e0'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    padding: '15px',
    backgroundColor: '#fff8e1'
  },
  paginationInfo: {
    fontSize: '13px',
    color: '#666',
    marginRight: '20px'
  },
  paginationBtn: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    borderRadius: '3px'
  },
  paginationBtnActive: {
    backgroundColor: '#ff9933',
    color: 'white',
    borderColor: '#ff9933'
  }
};

export default TestResultDashboard;