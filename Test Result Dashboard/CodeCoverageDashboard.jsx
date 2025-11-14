import React, { useState, useMemo } from 'react';

const CodeCoverageDashboard = () => {
  // State management
  const [filters, setFilters] = useState({
    account: 'GSI-4',
    project: 'DCOD'
  });

  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [expandedRepos, setExpandedRepos] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data for ADO Projects
  const [adoProjects] = useState([
    {
      id: 1,
      name: 'DCOD',
      numberOfTestCases: 200,
      environment: 'INT',
      executionDate: '28/01/2024',
      coveragePercentage: 72.5
    }
  ]);

  // Mock data for Repositories
  const [repositories] = useState([
    {
      id: 1,
      name: 'MISI-SolnFlow-POM',
      totalCoverableLines: 1000,
      totalCoveredLines: 850,
      totalUncoveredLines: 150,
      coverage: 85,
      executionDate: ''
    },
    {
      id: 2,
      name: 'Bucketnest',
      totalCoverableLines: 1000,
      totalCoveredLines: 700,
      totalUncoveredLines: 300,
      coverage: 70,
      executionDate: ''
    },
    {
      id: 3,
      name: 'iHUB',
      totalCoverableLines: 3024,
      totalCoveredLines: 1171,
      totalUncoveredLines: 1853,
      coverage: 61,
      executionDate: '01/02/2024'
    },
    {
      id: 4,
      name: 'PTL',
      totalCoverableLines: 45,
      totalCoveredLines: 16,
      totalUncoveredLines: 29,
      coverage: 35,
      executionDate: '14/03/2024'
    }
  ]);

  // Pagination
  const itemsPerPage = 3;
  const totalPages = Math.ceil(repositories.length / itemsPerPage);
  const paginatedRepos = repositories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    console.log('Code Coverage Search with filters:', filters);
    alert('Code Coverage search executed!\n\nFilters:\n' + JSON.stringify(filters, null, 2));
  };

  const handleCancel = () => {
    setFilters({
      account: 'GSI-4',
      project: 'DCOD'
    });
    alert('Filters reset to default values!');
  };

  const toggleProject = (id) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleRepo = (id) => {
    setExpandedRepos(prev => {
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

  // Get coverage color based on percentage
  const getCoverageColor = (percentage) => {
    if (percentage >= 76) return '#4CAF50'; // Green
    if (percentage >= 51) return '#FFA726'; // Orange
    return '#f44336'; // Red
  };

  // Get coverage range label
  const getCoverageLabel = (percentage) => {
    if (percentage >= 76) return '76-100%';
    if (percentage >= 51) return '51-75%';
    return '0-50%';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Code Coverage</h3>
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

      {/* Coverage Legend */}
      <div style={styles.legendSection}>
        <div style={styles.legendTitle}>Coverage Percentages</div>
        <div style={styles.legendBar}>
          <div style={{ ...styles.legendSegment, backgroundColor: '#f44336', flex: 1 }}>
            <span style={styles.legendText}>0 - 50%</span>
          </div>
          <div style={{ ...styles.legendSegment, backgroundColor: '#FFA726', flex: 1 }}>
            <span style={styles.legendText}>51-75%</span>
          </div>
          <div style={{ ...styles.legendSegment, backgroundColor: '#4CAF50', flex: 1 }}>
            <span style={styles.legendText}>76-100%</span>
          </div>
        </div>
      </div>

      {/* ADO Project Table */}
      <div style={styles.tableSection}>
        <table style={styles.dataTable}>
          <thead>
            <tr>
              <th style={styles.th}>ADO Project</th>
              <th style={styles.th}>Number of Test Cases</th>
              <th style={styles.th}>Environment</th>
              <th style={styles.th}>Execution Date</th>
              <th style={styles.th}>% Code Test Coverage</th>
            </tr>
          </thead>
          <tbody>
            {adoProjects.map((project, index) => (
              <React.Fragment key={project.id}>
                <tr style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={styles.td}>
                    <button
                      style={styles.expandBtn}
                      onClick={() => toggleProject(project.id)}
                    >
                      {expandedProjects.has(project.id) ? '−' : '+'}
                    </button>
                    {project.name}
                  </td>
                  <td style={styles.td}>{project.numberOfTestCases}</td>
                  <td style={styles.td}>{project.environment}</td>
                  <td style={styles.td}>{project.executionDate}</td>
                  <td style={styles.td}>
                    <div style={styles.coverageBarContainer}>
                      <div 
                        style={{
                          ...styles.coverageBar,
                          width: `${project.coveragePercentage}%`,
                          backgroundColor: getCoverageColor(project.coveragePercentage)
                        }}
                      >
                        <span style={styles.coverageText}>{project.coveragePercentage}%</span>
                      </div>
                    </div>
                  </td>
                </tr>
                {expandedProjects.has(project.id) && (
                  <tr>
                    <td colSpan="5" style={styles.expandedContent}>
                      <div style={{ padding: '15px', backgroundColor: '#e3f2fd' }}>
                        <strong>Project Details:</strong>
                        <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
                          <li>Total Test Cases: {project.numberOfTestCases}</li>
                          <li>Environment: {project.environment}</li>
                          <li>Last Execution: {project.executionDate}</li>
                          <li>Coverage Status: {getCoverageLabel(project.coveragePercentage)}</li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Repositories Table */}
      <div style={styles.tableSection}>
        <table style={styles.dataTable}>
          <thead>
            <tr>
              <th style={styles.th}>Repositories</th>
              <th style={styles.th}>Total Coverable Lines</th>
              <th style={styles.th}>Total Covered Lines</th>
              <th style={styles.th}>Total Uncovered Lines</th>
              <th style={styles.th}>Coverage</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRepos.map((repo, index) => (
              <React.Fragment key={repo.id}>
                <tr style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={styles.td}>
                    <button
                      style={styles.expandBtn}
                      onClick={() => toggleRepo(repo.id)}
                    >
                      {expandedRepos.has(repo.id) ? '−' : '+'}
                    </button>
                    {repo.name}
                  </td>
                  <td style={styles.td}>{repo.totalCoverableLines.toLocaleString()}</td>
                  <td style={styles.td}>{repo.totalCoveredLines.toLocaleString()}</td>
                  <td style={styles.td}>{repo.totalUncoveredLines.toLocaleString()}</td>
                  <td style={styles.td}>
                    <div style={styles.coverageBarContainer}>
                      <div 
                        style={{
                          ...styles.coverageBar,
                          width: `${repo.coverage}%`,
                          backgroundColor: getCoverageColor(repo.coverage)
                        }}
                      >
                        <span style={styles.coverageText}>{repo.coverage}%</span>
                      </div>
                    </div>
                  </td>
                </tr>
                {expandedRepos.has(repo.id) && (
                  <tr>
                    <td colSpan="5" style={styles.expandedContent}>
                      <div style={{ padding: '15px', backgroundColor: '#e3f2fd' }}>
                        <strong>Repository Details:</strong>
                        <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                          <div>
                            <p><strong>Coverage Ratio:</strong> {repo.totalCoveredLines}/{repo.totalCoverableLines}</p>
                            <p><strong>Coverage Percentage:</strong> {repo.coverage}%</p>
                          </div>
                          <div>
                            <p><strong>Lines Not Covered:</strong> {repo.totalUncoveredLines}</p>
                            {repo.executionDate && <p><strong>Last Execution:</strong> {repo.executionDate}</p>}
                          </div>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                          <strong>Coverage Breakdown:</strong>
                          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                            <div style={{ flex: repo.coverage, backgroundColor: getCoverageColor(repo.coverage), padding: '5px', color: 'white', textAlign: 'center', borderRadius: '3px' }}>
                              Covered: {repo.coverage}%
                            </div>
                            <div style={{ flex: (100 - repo.coverage), backgroundColor: '#f44336', padding: '5px', color: 'white', textAlign: 'center', borderRadius: '3px' }}>
                              Not Covered: {100 - repo.coverage}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={styles.pagination}>
        <span style={styles.paginationInfo}>
          Showing 1 to {Math.min(currentPage * itemsPerPage, repositories.length)} of {repositories.length} entries
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
        <button style={{ ...styles.paginationBtn, ...styles.paginationBtnActive }}>
          {currentPage}
        </button>
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

      {/* Summary Section */}
      <div style={styles.summarySection}>
        <div style={styles.summaryCard}>
          <h4 style={styles.summaryTitle}>Coverage Summary</h4>
          <div style={styles.summaryContent}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Total Repositories:</span>
              <span style={styles.summaryValue}>{repositories.length}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Avg Coverage:</span>
              <span style={styles.summaryValue}>
                {(repositories.reduce((sum, r) => sum + r.coverage, 0) / repositories.length).toFixed(1)}%
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>High Coverage (≥76%):</span>
              <span style={{ ...styles.summaryValue, color: '#4CAF50' }}>
                {repositories.filter(r => r.coverage >= 76).length}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Medium Coverage (51-75%):</span>
              <span style={{ ...styles.summaryValue, color: '#FFA726' }}>
                {repositories.filter(r => r.coverage >= 51 && r.coverage < 76).length}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Low Coverage (&lt;51%):</span>
              <span style={{ ...styles.summaryValue, color: '#f44336' }}>
                {repositories.filter(r => r.coverage < 51).length}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <h4 style={styles.summaryTitle}>Lines of Code</h4>
          <div style={styles.summaryContent}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Total Coverable Lines:</span>
              <span style={styles.summaryValue}>
                {repositories.reduce((sum, r) => sum + r.totalCoverableLines, 0).toLocaleString()}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Total Covered Lines:</span>
              <span style={{ ...styles.summaryValue, color: '#4CAF50' }}>
                {repositories.reduce((sum, r) => sum + r.totalCoveredLines, 0).toLocaleString()}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Total Uncovered Lines:</span>
              <span style={{ ...styles.summaryValue, color: '#f44336' }}>
                {repositories.reduce((sum, r) => sum + r.totalUncoveredLines, 0).toLocaleString()}
              </span>
            </div>
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
    gridTemplateColumns: 'repeat(2, 1fr)',
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
  legendSection: {
    backgroundColor: 'white',
    padding: '15px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  legendTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '10px'
  },
  legendBar: {
    display: 'flex',
    height: '40px',
    borderRadius: '4px',
    overflow: 'hidden',
    border: '1px solid #ddd'
  },
  legendSegment: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '500',
    fontSize: '13px'
  },
  legendText: {
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
  },
  tableSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  dataTable: {
    width: '100%',
    borderCollapse: 'collapse'
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
    padding: '0 10px 0 0',
    marginRight: '5px'
  },
  expandedContent: {
    backgroundColor: '#f6f8fb',
    borderBottom: '1px solid #e0e0e0'
  },
  coverageBarContainer: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
    height: '24px',
    position: 'relative'
  },
  coverageBar: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'width 0.3s ease',
    minWidth: '40px'
  },
  coverageText: {
    color: 'white',
    fontSize: '11px',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    padding: '15px',
    backgroundColor: '#fff8e1',
    borderRadius: '8px'
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
    backgroundColor: '#c8a500',
    color: 'white',
    borderColor: '#c8a500'
  },
  summarySection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginTop: '20px'
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  summaryTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    borderBottom: '2px solid #1f4e79',
    paddingBottom: '8px'
  },
  summaryContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  summaryLabel: {
    fontSize: '13px',
    color: '#666'
  },
  summaryValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  }
};

export default CodeCoverageDashboard;