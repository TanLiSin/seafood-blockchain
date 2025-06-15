import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegulatoryHome.css';
import './CatchRecord.css';
import './Search.css';

function DistributedDatabaseDistributor() {
  const [view, setView] = useState('freshness');
  const [catchRecords, setCatchRecords] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const user_id = localStorage.getItem('user_id');

  const distributorUsername = localStorage.getItem('username'); // Assuming stored as 'username'

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

  useEffect(() => {
    fetchFreshnessRecords();
    fetchTransactions();
  }, []);

  const getDistributorFreshness = () => {
    const distributorProductIds = transactions
      .filter(txn => txn.end_user === distributorUsername)
      .map(txn => txn.product_id);

    return catchRecords.filter(record => distributorProductIds.includes(record.product_id));
  };

  const getDistributorTransactions = () => {
    return transactions.filter(txn => txn.end_user === distributorUsername);
  };

  const filterData = () => {
    const data = view === 'freshness' ? getDistributorFreshness() : getDistributorTransactions();
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

    setFilteredData(filtered);
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

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user_id) return;
    const res = await fetch(`${import.meta.env.VITE_NODE_API}/api/notifications?user_id=${user_id}`);
    const data = await res.json();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user_id]);

  // Mark notification as read
  const markAsRead = async (id) => {
    await fetch(`${import.meta.env.VITE_NODE_API}/api/notifications/${id}/read`, {
      method: 'PATCH'
    });
    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }
  
  return (
    <div className="distributor-page">
      <header>
        <div className="left-section">
          {/* Notification Bell with Dropdown */}
          <div style={{ position: 'relative', marginRight: '10px' }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                fontSize: '1.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              🔔{unreadCount > 0 && <span style={{ color: 'red' }}>●</span>}
            </button>

            {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '35px',
              left: '0',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              width: '300px',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <h4 style={{ margin: '10px' }}>Notifications</h4>
              {notifications.length === 0 ? (
                <p style={{ margin: '10px' }}>No notifications.</p>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    style={{
                      padding: '10px',
                      borderBottom: '1px solid #eee',
                      backgroundColor: n.is_read ? '#f9f9f9' : '#e8f4ff',
                      cursor: 'pointer'
                    }}
                    onClick={() => markAsRead(n.id)}
                  >
                    {n.message}
                    <div style={{ fontSize: '0.75rem', color: '#555' }}>
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          </div>
          <h1 className="brand">DISTRIBUTOR</h1>
        </div>
        <nav className="nav-links">
          <Link to="/distributor-home">HOME</Link>
          <Link to="/process-record-distributor">PROCESS RECORD</Link>
          <Link to="/track-recall-distributor">TRACK RECALL</Link>
          <Link to="/shared-ledger-distributor">SHARED LEDGER</Link>
          <Link to="/distributed-database-distributor" className="active">DISTRIBUTED DATABASE</Link>
        </nav>
        <Link to="/" className="logout" onClick={handleLogout}>LOGOUT ⤴</Link>
      </header>

      <main>
        <div className="welcome-section">
          <h2>Distributor: Download Data</h2>

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

            <button onClick={filterData} style={{ marginLeft: '1rem', borderRadius: '8px' }}>
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

export default DistributedDatabaseDistributor;
