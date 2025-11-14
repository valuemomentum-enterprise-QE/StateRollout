import React, { useState, useMemo } from 'react';

const TestDataRepository = () => {
  // State management
  const [filters, setFilters] = useState({
    projectName: 'DCOD',
    environment: '7 ITEMS SELECTED'
  });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('view'); // 'view' or 'add'

  // Mock data for Test Data Repository
  const [testData] = useState([
    {
      id: 1,
      sNo: 1,
      projectName: 'DCOD',
      featureName: 'PackageReg_TCID_194787',
      scenarioName: 'PackageReg_TCID_194787',
      environment: 'QA02',
      dataKey: 'PolicyNumber',
      dataValue: 'T9A5C00000582-00',
      isUsed: false,
      dateCreated: '2024-02-06',
      dateUsed: '2024-02-06'
    },
    {
      id: 2,
      sNo: 2,
      projectName: 'DCOD',
      featureName: 'PackageReg_TCID_197836',
      scenarioName: 'PackageReg_TCID_197836',
      environment: 'QA02',
      dataKey: 'PolicyNumber',
      dataValue: 'T9A5C00000583-00',
      isUsed: false,
      dateCreated: '2024-02-06',
      dateUsed: '2024-02-06'
    },
    {
      id: 3,
      sNo: 3,
      projectName: 'DCOD',
      featureName: 'PackageReg_TCID_198052',
      scenarioName: 'PackageReg_TCID_198052',
      environment: 'QA02',
      dataKey: 'PolicyNumber',
      dataValue: 'T9A5C00000585-00',
      isUsed: false,
      dateCreated: '2024-02-06',
      dateUsed: '2024-02-06'
    },
    {
      id: 4,
      sNo: 4,
      projectName: 'DCOD',
      featureName: 'PackageReg_TCID_200638',
      scenarioName: 'PackageReg_TCID_200638',
      environment: 'QA02',
      dataKey: 'PolicyNumber',
      dataValue: 'T9A5C00000587-00',
      isUsed: false,
      dateCreated: '2024-02-06',
      dateUsed: '2024-02-06'
    },
    {
      id: 5,
      sNo: 5,
      projectName: 'DCOD',
      featureName: 'PEP_Property_Smoke',
      scenarioName: 'PEP_Property_Smoke',
      environment: 'QA03',
      dataKey: 'PolicyNumber',
      dataValue: 'T9A29P001888-00',
      isUsed: true,
      dateCreated: '2024-02-06',
      dateUsed: '2024-02-06'
    },
    {
      id: 6,
      sNo: 6,
      projectName: 'DCOD',
      featureName: 'PEP_GeneralLiability_Smoke',
      scenarioName: 'PEP_GeneralLiability_Smoke',
      environment: 'UAT03',
      dataKey: 'PolicyNumber',
      dataValue: 'T9A5GLW00073-00',
      isUsed: true,
      dateCreated: '2024-02-06',
      dateUsed: '2024-02-06'
    },
    {
      id: 7,
      sNo: 7,
      projectName: 'DCOD',
      featureName: 'PEP_Property_Smoke',
      scenarioName: 'PEP_Property_Smoke',
      environment: 'QA03',
      dataKey: 'PolicyNumber',
      dataValue: 'T9A29P000068-00',
      isUsed: true,
      dateCreated: '2024-02-06',
      dateUsed: '2024-02-06'
    },
    {
      id: 8,
      sNo: 8,
      projectName: 'DCOD',
      featureName: 'PEP_GeneralLiability_Smoke',
      scenarioName: 'PEP_GeneralLiability_Smoke',
      environment: 'QA03',
      dataKey: 'PolicyNumber',
      dataValue: 'T9A5GLW00422-00',
      isUsed: true,
      dateCreated: '2024-02-07',
      dateUsed: '2024-02-07'
    }
  ]);

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
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEntries = testData.length;
    const usedEntries = testData.filter(item => item.isUsed).length;
    const availableEntries = totalEntries - usedEntries;
    
    return { totalEntries, usedEntries, availableEntries };
  }, [testData]);

  // Handlers
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    console.log('Test Data Search with filters:', filters);
    alert('Test Data search executed!\n\nFilters:\n' + JSON.stringify(filters, null, 2));
  };

  const handleCancel = () => {
    setFilters({
      projectName: 'DCOD',
      environment: '7 ITEMS SELECTED'
    });
    setSearchKeyword('');
    alert('Filters reset to default values!');
  };

  const handleExport = () => {
    const csvContent = [
      ['S.No', 'Project Name', 'Feature Name', 'Scenario Name', 'Environment', 'Data Key', 'Data Value', 'IsUsed', 'Date Created', 'Date Used'],
      ...filteredData.map(item => [
        item.sNo,
        item.projectName,
        item.featureName,
        item.scenarioName,
        item.environment,
        item.dataKey,
        item.dataValue,
        item.isUsed,
        item.dateCreated,
        item.dateUsed
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-data-repository.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewTestData = () => {
    setViewMode('view');
  };

  const handleAddTestData = () => {
    setViewMode('add');
    alert('Add Test Data form would open here. This feature allows you to add new test data entries.');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Test Data Repository</h3>
      </div>

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <button 
          style={{
            ...styles.actionBtn,
            ...(viewMode === 'view' ? styles.actionBtnActive : {})
          }}
          onClick={handleViewTestData}
        >
          📊 View Test Data
        </button>
        <button 
          style={{
            ...styles.actionBtn,
            ...(viewMode === 'add' ? styles.actionBtnActive : {})
          }}
          onClick={handleAddTestData}
        >
          ➕ Add Test Data
        </button>
      </div>

      {/* Filters Section */}
      <div style={styles.filtersSection}>
        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Project Name</label>
            <select 
              style={styles.select}
              value={filters.projectName}
              onChange={(e) => handleFilterChange('projectName', e.target.value)}
            >
              <option>DCOD</option>
              <option>Project A</option>
              <option>Project B</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Environment</label>
            <select 
              style={styles.select}
              value={filters.environment}
              onChange={(e) => handleFilterChange('environment', e.target.value)}
            >
              <option>7 ITEMS SELECTED</option>
              <option>QA01</option>
              <option>QA02</option>
              <option>QA03</option>
              <option>UAT03</option>
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

      {/* Export and Search Section */}
      <div style={styles.exportSection}>
        <button style={styles.exportBtn} onClick={handleExport}>
          📤 Export
        </button>
        <input
          type="text"
          style={styles.searchBox}
          placeholder="🔍 Search Keyword"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsSection}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Entries</div>
          <div style={styles.statValue}>{stats.totalEntries}</div>
        </div>
        <div style={{ ...styles.statCard, borderLeftColor: '#4CAF50' }}>
          <div style={styles.statLabel}>Available</div>
          <div style={{ ...styles.statValue, color: '#4CAF50' }}>{stats.availableEntries}</div>
        </div>
        <div style={{ ...styles.statCard, borderLeftColor: '#f44336' }}>
          <div style={styles.statLabel}>Used</div>
          <div style={{ ...styles.statValue, color: '#f44336' }}>{stats.usedEntries}</div>
        </div>
      </div>

      {/* Data Table */}
      <div style={styles.tableSection}>
        <table style={styles.dataTable}>
          <thead>
            <tr>
              <th style={styles.th}>S.No.</th>
              <th style={styles.th}>Project Name</th>
              <th style={styles.th}>Feature Name</th>
              <th style={styles.th}>Scenario Name</th>
              <th style={styles.th}>Environment</th>
              <th style={styles.th}>Data Key</th>
              <th style={styles.th}>Data Value</th>
              <th style={styles.th}>IsUsed</th>
              <th style={styles.th}>Date Created</th>
              <th style={styles.th}>Date Used</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={item.id} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                <td style={styles.td}>{item.sNo}</td>
                <td style={styles.td}>{item.projectName}</td>
                <td style={styles.td}>{item.featureName}</td>
                <td style={styles.td}>{item.scenarioName}</td>
                <td style={styles.td}>{item.environment}</td>
                <td style={styles.td}>{item.dataKey}</td>
                <td style={styles.td}>{item.dataValue}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: item.isUsed ? '#f44336' : '#4CAF50',
                    color: 'white'
                  }}>
                    {item.isUsed ? 'true' : 'false'}
                  </span>
                </td>
                <td style={styles.td}>{item.dateCreated}</td>
                <td style={styles.td}>{item.dateUsed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={styles.pagination}>
        <span style={styles.paginationInfo}>
          Showing 1 to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
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
        {[...Array(Math.min(5, totalPages))].map((_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              style={{
                ...styles.paginationBtn,
                ...(currentPage === pageNum ? styles.paginationBtnActive : {})
              }}
              onClick={() => goToPage(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}
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

      {/* Additional Information */}
      <div style={styles.infoSection}>
        <div style={styles.infoCard}>
          <h4 style={styles.infoTitle}>Test Data Information</h4>
          <div style={styles.infoContent}>
            <p><strong>Repository:</strong> Central test data storage for all test scenarios</p>
            <p><strong>Purpose:</strong> Manage and track test data usage across environments</p>
            <p><strong>Usage Status:</strong> Tracks whether data has been used in testing</p>
            <p><strong>Data Keys:</strong> Identifiers for different types of test data (e.g., PolicyNumber, AccountID)</p>
          </div>
        </div>

        <div style={styles.infoCard}>
          <h4 style={styles.infoTitle}>Environment Distribution</h4>
          <div style={styles.infoContent}>
            {['QA02', 'QA03', 'UAT03'].map(env => {
              const count = testData.filter(item => item.environment === env).length;
              return (
                <div key={env} style={styles.envItem}>
                  <span style={styles.envLabel}>{env}:</span>
                  <span style={styles.envValue}>{count} entries</span>
                  <div style={styles.envBar}>
                    <div 
                      style={{
                        ...styles.envBarFill,
                        width: `${(count / testData.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              );
            })}
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
  actionButtons: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  actionBtn: {
    padding: '10px 20px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'all 0.3s ease'
  },
  actionBtnActive: {
    backgroundColor: '#1f4e79',
    color: 'white',
    borderColor: '#1f4e79'
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
  exportSection: {
    backgroundColor: '#fff8e1',
    padding: '15px 20px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '8px'
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
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    marginBottom: '20px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #1f4e79',
    textAlign: 'center'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '10px'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333'
  },
  tableSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'auto'
  },
  dataTable: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1200px'
  },
  th: {
    backgroundColor: '#002b5c',
    color: 'white',
    padding: '12px 15px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  td: {
    padding: '12px 15px',
    fontSize: '12px',
    color: '#333',
    borderBottom: '1px solid #e0e0e0',
    whiteSpace: 'nowrap'
  },
  trEven: {
    backgroundColor: '#f9f9f9'
  },
  trOdd: {
    backgroundColor: 'white'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-block'
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
    backgroundColor: '#ff9933',
    color: 'white',
    borderColor: '#ff9933'
  },
  infoSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginTop: '20px'
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
    borderBottom: '2px solid #3b5998',
    paddingBottom: '8px'
  },
  infoContent: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.8'
  },
  envItem: {
    marginBottom: '12px'
  },
  envLabel: {
    fontWeight: '600',
    color: '#333',
    display: 'inline-block',
    minWidth: '60px'
  },
  envValue: {
    color: '#666',
    marginLeft: '10px'
  },
  envBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    marginTop: '5px',
    overflow: 'hidden'
  },
  envBarFill: {
    height: '100%',
    backgroundColor: '#1f4e79',
    transition: 'width 0.3s ease'
  }
};

export default TestDataRepository;