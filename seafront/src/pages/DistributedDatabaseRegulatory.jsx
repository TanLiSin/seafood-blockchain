import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './RegulatoryHome.css';
import './CatchRecord.css';
import './Search.css';

function DistributedDatabaseRegulatory() {
  const [view, setView] = useState('freshness');
  const [freshnessView, setFreshnessView] = useState('all');
  const [transactionView, setTransactionView] = useState('all');

  const [catchRecords, setCatchRecords] = useState([]);
  const [companyFreshness, setCompanyFreshness] = useState([]);
  const [supplierFreshness, setSupplierFreshness] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [companyTransactions, setCompanyTransactions] = useState([]);
  const [supplierTransactions, setSupplierTransactions] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const formatDateOnly = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const fetchFreshnessRecords = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/freshness-records`);
      const data = await response.json();
      setCatchRecords(data);
    } catch (error) {
      console.error('Error fetching freshness:', error);
      setCatchRecords([]);
    }
  };

  const fetchCompanyFreshness = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/company-freshness-records`);
      const data = await response.json();
      setCompanyFreshness(data);
    } catch (error) {
      console.error('Error fetching company freshness:', error);
      setCompanyFreshness([]);
    }
  };

  const fetchSupplierFreshness = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/supplier-freshness-records`);
      const data = await response.json();
      setSupplierFreshness(data);
    } catch (error) {
      console.error('Error fetching supplier freshness:', error);
      setSupplierFreshness([]);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/transactions`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  const fetchCompanyTransactions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/company-transactions`);
      const data = await response.json();
      setCompanyTransactions(data);
    } catch (error) {
      console.error('Error fetching company transactions:', error);
      setCompanyTransactions([]);
    }
  };

  const fetchSupplierTransactions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/supplier-transactions`);
      const data = await response.json();
      setSupplierTransactions(data);
    } catch (error) {
      console.error('Error fetching supplier transactions:', error);
      setSupplierTransactions([]);
    }
  };

  useEffect(() => {
    fetchFreshnessRecords();
    fetchCompanyFreshness();
    fetchSupplierFreshness();
    fetchTransactions();
    fetchCompanyTransactions();
    fetchSupplierTransactions();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const getCurrentFreshnessData = () => {
    if (freshnessView === 'all') return catchRecords;
    if (freshnessView === 'company') return companyFreshness;
    if (freshnessView === 'supplier') return supplierFreshness;
    return [];
  };

  const getCurrentTransactionData = () => {
    if (transactionView === 'all') return transactions;
    if (transactionView === 'company') return companyTransactions;
    if (transactionView === 'supplier') return supplierTransactions;
    return [];
  };

  const filterData = (data) => {
    const lowerSearch = searchTerm.toLowerCase();
    let filtered = data.filter((record) =>
      Object.values(record).some((val) =>
        String(val).toLowerCase().includes(lowerSearch)
      )
    );

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.created_at);
        return recordDate >= start && recordDate <= end;
      });
    }

    return filtered;
  };

  const downloadCSV = (data, fileName) => {
    if (!data.length) {
      alert('No records to download.');
      return;
    }
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));

    data.forEach((row) => {
      const values = headers.map((header) =>
        `"${(row[header] ?? '').toString().replace(/"/g, '""')}"`
      );
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="regulatory-page">
      <header>
        <div className="left-section">
          <span className="notify-icon">🔔</span>
          <h1 className="brand">REGULATORY</h1>
        </div>
        <nav className="nav-links">
          <Link to="/regulatory-home">HOME</Link>
          <Link to="/process-record-regulatory">PROCESS RECORD</Link>
          <Link to="/catch-record-regulatory">CATCH RECORD</Link>
          <Link to="/trade-record-regulatory">TRADE RECORD</Link>
          <Link to="/shared-ledger-regulatory">SHARED LEDGER</Link>
          <Link to="/distributed-database" className="active">DISTRIBUTED DATABASE</Link>
        </nav>
        <Link to="/" className="logout" onClick={handleLogout}>LOGOUT ⤴</Link>
      </header>

      <main>
        <div className="welcome-section">
          <h2>Distributed Database: Download Data</h2>

          <div style={{ margin: '1rem 0' }}>
            <button
              onClick={() => setView('freshness')}
              style={{
                backgroundColor: view === 'freshness' ? '#1a1a1a' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                marginRight: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Freshness Data
            </button>
            <button
              onClick={() => setView('transaction')}
              style={{
                backgroundColor: view === 'transaction' ? '#1a1a1a' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer'
              }}
            >
              Transaction Data
            </button>
          </div>

          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-box"
          />

          <div style={{ margin: '1rem 0' }}>
            <label style={{ marginRight: '1rem' }}>
              Start Date:
              <input
                type="date"
                className="date-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label style={{ marginRight: '1rem' }}>
              End Date:
              <input
                type="date"
                className="date-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>

            <button onClick={() => {
              const dataToFilter = view === 'freshness' ? getCurrentFreshnessData() : getCurrentTransactionData();
              const filtered = filterData(dataToFilter);
              setFilteredData(filtered);
            }} style={{ marginLeft: '1rem' }}>
              Filter Records
            </button>

            <button onClick={() => {
              if (!filteredData.length) {
                alert('No records to download.');
                return;
              }
              downloadCSV(filteredData, `${view}_records_${startDate}_to_${endDate}.csv`);
            }} style={{
              marginLeft: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              Download {view === 'freshness' ? 'Freshness' : 'Transaction'} Data
            </button>
          </div>

          {filteredData.length > 0 && (
            <div className="record-table-container" style={{ marginTop: '1rem' }}>
              <table className="record-table">
                <thead>
                  {view === 'freshness' ? (
                    <tr>
                      <th>Product ID</th>
                      <th>Weight (kg)</th>
                      <th>Date</th>
                      <th>Dissolved Oxygen</th>
                      <th>Temperature</th>
                      <th>pH Level</th>
                      <th>Ammonia</th>
                      <th>Metals</th>
                      <th>Bacteria</th>
                      <th>Freshness Score</th>
                      <th>Freshness Label</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>Transaction ID</th>
                      <th>Product ID</th>
                      <th>Amount</th>
                      <th>Freshness</th>
                      <th>End User</th>
                      <th>Expiry Date</th>
                      <th>Date/Time</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {filteredData.map((record, index) => (
                    <tr key={index}>
                      {view === 'freshness' ? (
                        <>
                          <td>{record.product_id || '-'}</td>
                          <td>{record.quantity ?? '-'}</td>
                          <td>{record.created_at ? formatDateOnly(record.created_at) : '-'}</td>
                          <td>{record.dissolved_oxygen ?? '-'}</td>
                          <td>{record.temperature ?? '-'}</td>
                          <td>{record.ph_level ?? '-'}</td>
                          <td>{record.ammonia ?? '-'}</td>
                          <td>{record.metals ?? '-'}</td>
                          <td>{record.bacteria ?? '-'}</td>
                          <td>{record.freshness_score ?? '-'}</td>
                          <td>{record.freshness_label ?? '-'}</td>
                        </>
                      ) : (
                        <>
                          <td>{record.transaction_id || '-'}</td>
                          <td>{record.product_id || '-'}</td>
                          <td>{isNaN(parseInt(record.amount)) ? '-' : parseInt(record.amount)}</td>
                          <td>{record.freshness || '-'}</td>
                          <td>{record.end_user || '-'}</td>
                          <td>{record.expiry_date ? formatDateOnly(record.expiry_date) : '-'}</td>
                          <td>{record.created_at ? formatDateOnly(record.created_at) : '-'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DistributedDatabaseRegulatory;
