import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SprintAnalyticsDashboard = () => {
  // State management
  const [filters, setFilters] = useState({
    account: 'GSI-2',
    project: 'DCOD',
    environment: '2 ITEMS SELECTED',
    category: '2 items selected',
    sprintName: '3 items selected'
  });

  // Mock data for Category chart (Passed/Failed counts)
  const categoryData = [
    {
      name: 'Regression',
      passedCount: 4,
      failedCount: 2
    },
    {
      name: 'Smoke',
      passedCount: 1,
      failedCount: 3
    }
  ];

  // Mock data for Sprint chart (Duration in hours)
  const sprintData = [
    {
      name: 'Sprint-Q34276',
      regression: 0.28,
      smoke: 0.42
    }
  ];

  // Calculate totals
  const categoryTotals = useMemo(() => {
    const totalPassed = categoryData.reduce((sum, item) => sum + item.passedCount, 0);
    const totalFailed = categoryData.reduce((sum, item) => sum + item.failedCount, 0);
    const total = totalPassed + totalFailed;
    return { totalPassed, totalFailed, total };
  }, []);

  const sprintTotals = useMemo(() => {
    const totalRegression = sprintData.reduce((sum, item) => sum + item.regression, 0);
    const totalSmoke = sprintData.reduce((sum, item) => sum + item.smoke, 0);
    const total = totalRegression + totalSmoke;
    return { totalRegression, totalSmoke, total };
  }, []);

  // Handlers
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    console.log('Sprint Analytics Search with filters:', filters);
    alert('Sprint Analytics search executed!\n\nFilters:\n' + JSON.stringify(filters, null, 2));
  };

  const handleCancel = () => {
    setFilters({
      account: 'GSI-2',
      project: 'DCOD',
      environment: '2 ITEMS SELECTED',
      category: '2 items selected',
      sprintName: '3 items selected'
    });
    alert('Filters reset to default values!');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Sprint Analytics</h3>
        <button style={styles.minimizeBtn}>−</button>
      </div>

      {/* Filters Section */}
      <div style={styles.filtersSection}>
        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Account</label>
            <select 
              style={styles.select}
              value={filters.account}
              onChange={(e) => handleFilterChange('account', e.target.value)}
            >
              <option>GSI-2</option>
              <option>GSI-3</option>
              <option>GSI-4</option>
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
            <label style={styles.label}>Category</label>
            <select 
              style={styles.select}
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option>2 items selected</option>
              <option>Regression</option>
              <option>Smoke</option>
              <option>Functional</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Sprint Name</label>
            <select 
              style={styles.select}
              value={filters.sprintName}
              onChange={(e) => handleFilterChange('sprintName', e.target.value)}
            >
              <option>3 items selected</option>
              <option>Sprint-Q34276</option>
              <option>Sprint-Q34277</option>
              <option>Sprint-Q34278</option>
            </select>
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
      </div>

      {/* Charts Section */}
      <div style={styles.chartsContainer}>
        {/* Category Chart - Passed/Failed Count */}
        <div style={styles.chartBox}>
          <div style={styles.chartLegend}>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendColor, backgroundColor: '#4CAF50' }}></span>
              <span style={styles.legendText}>Passed Count</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendColor, backgroundColor: '#f44336' }}></span>
              <span style={styles.legendText}>Failed Count</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={categoryData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="name" 
                label={{ value: 'Category', position: 'insideBottom', offset: -10 }}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                label={{ value: 'Passed/Failed Count', angle: -90, position: 'insideLeft' }}
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Bar dataKey="passedCount" fill="#4CAF50" name="Passed Count" stackId="a" />
              <Bar dataKey="failedCount" fill="#f44336" name="Failed Count" stackId="a" />
            </BarChart>
          </ResponsiveContainer>

          <div style={styles.chartStats}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Passed:</span>
              <span style={{ ...styles.statValue, color: '#4CAF50' }}>{categoryTotals.totalPassed}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Failed:</span>
              <span style={{ ...styles.statValue, color: '#f44336' }}>{categoryTotals.totalFailed}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Tests:</span>
              <span style={styles.statValue}>{categoryTotals.total}</span>
            </div>
          </div>
        </div>

        {/* Sprint Chart - Duration */}
        <div style={styles.chartBox}>
          <div style={styles.chartLegend}>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendColor, backgroundColor: '#9C27B0' }}></span>
              <span style={styles.legendText}>Regression</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendColor, backgroundColor: '#4CAF50' }}></span>
              <span style={styles.legendText}>Smoke</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={sprintData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="name" 
                label={{ value: 'Sprint Name', position: 'insideBottom', offset: -10 }}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                label={{ value: 'Duration(Minutes)', angle: -90, position: 'insideLeft' }}
                style={{ fontSize: '12px' }}
                domain={[0, 0.45]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
                formatter={(value) => `${value.toFixed(2)} min`}
              />
              <Bar dataKey="regression" fill="#9C27B0" name="Regression" />
              <Bar dataKey="smoke" fill="#4CAF50" name="Smoke" />
            </BarChart>
          </ResponsiveContainer>

          <div style={styles.chartStats}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Regression Time:</span>
              <span style={{ ...styles.statValue, color: '#9C27B0' }}>{sprintTotals.totalRegression.toFixed(2)} min</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Smoke Time:</span>
              <span style={{ ...styles.statValue, color: '#4CAF50' }}>{sprintTotals.totalSmoke.toFixed(2)} min</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Duration:</span>
              <span style={styles.statValue}>{sprintTotals.total.toFixed(2)} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div style={styles.infoSection}>
        <div style={styles.infoCard}>
          <h4 style={styles.infoTitle}>Sprint Summary</h4>
          <div style={styles.infoContent}>
            <p><strong>Active Sprints:</strong> 3</p>
            <p><strong>Total Test Cases:</strong> {categoryTotals.total}</p>
            <p><strong>Pass Rate:</strong> {((categoryTotals.totalPassed / categoryTotals.total) * 100).toFixed(1)}%</p>
            <p><strong>Avg Duration:</strong> {((sprintTotals.total / sprintData.length)).toFixed(2)} min</p>
          </div>
        </div>

        <div style={styles.infoCard}>
          <h4 style={styles.infoTitle}>Category Breakdown</h4>
          <div style={styles.infoContent}>
            {categoryData.map(cat => (
              <div key={cat.name} style={styles.categoryBreakdown}>
                <span style={styles.categoryName}>{cat.name}:</span>
                <span style={styles.categoryValues}>
                  ✅ {cat.passedCount} | ❌ {cat.failedCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px',
    minHeight: '600px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #ddd'
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#333'
  },
  minimizeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666',
    padding: '0 10px'
  },
  filtersSection: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  filters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '15px',
    marginBottom: '15px'
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
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px'
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
  chartsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '20px'
  },
  chartBox: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  chartLegend: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #e0e0e0'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  legendColor: {
    width: '16px',
    height: '16px',
    borderRadius: '2px'
  },
  legendText: {
    fontSize: '13px',
    color: '#666',
    fontWeight: '500'
  },
  chartStats: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #e0e0e0'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666'
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333'
  },
  infoSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px'
  },
  infoCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  infoTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    borderBottom: '2px solid #1f4e79',
    paddingBottom: '8px'
  },
  infoContent: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.8'
  },
  categoryBreakdown: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  categoryName: {
    fontWeight: '500',
    color: '#333'
  },
  categoryValues: {
    color: '#666'
  }
};

export default SprintAnalyticsDashboard;