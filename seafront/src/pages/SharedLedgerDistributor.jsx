import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DistributorHome.css';
import './CatchRecord.css';
import './Search.css';

function SharedLedgerDistributor() {
  const [view, setView] = useState('freshness');
  const [freshnessRecords, setFreshnessRecords] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const user_id = localStorage.getItem('user_id');

  const formatDateOnly = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const fetchSharedLedgerData = async () => {
    try {
      const distributorName = localStorage.getItem('username');
      const response = await fetch(
        `${import.meta.env.VITE_NODE_API}/api/shared-ledger-distributor?distributorName=${distributorName}`
      );
      const data = await response.json();
      setFreshnessRecords(data.freshnessRecords || []);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching shared ledger data:', error);
      setFreshnessRecords([]);
      setTransactions([]);
    }
  };

  useEffect(() => {
    fetchSharedLedgerData();
  }, []);

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

  const filterData = (data) => {
    if (!searchTerm) return data;
    return data.filter((record) =>
      Object.values(record).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const renderFreshnessTable = () => {
    const filteredData = filterData(freshnessRecords);
    return (
      <div className="record-table-container">
        <table className="record-table">
          <thead>
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
              <th>Blockchain Txn ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((record) => (
                <tr key={record.id}>
                  <td>{record.product_id}</td>
                  <td>{record.quantity}</td>
                  <td>{formatDateOnly(record.created_at)}</td>
                  <td>{record.dissolved_oxygen}</td>
                  <td>{record.temperature}</td>
                  <td>{record.ph_level}</td>
                  <td>{record.ammonia}</td>
                  <td>{record.metals}</td>
                  <td>{record.bacteria}</td>
                  <td>{record.freshness_score}</td>
                  <td>{record.freshness_label}</td>
                  <td>{record.blockchain_tx_id ? record.blockchain_tx_id.slice(0, 10) + '...' : 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="12">No freshness records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTransactionTable = () => {
    const filteredData = filterData(transactions).filter(tx =>
      tx.transaction_id &&
      tx.product_id &&
      tx.created_at &&
      !isNaN(parseInt(tx.amount)) &&
      typeof tx.freshness === 'string'
    );

    return (
      <div className="record-table-container">
        <table className="record-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Product ID</th>
              <th>Amount</th>
              <th>Freshness</th>
              <th>Sender</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Expiry Date</th>
              <th>Date/Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.transaction_id}</td>
                  <td>{tx.product_id}</td>
                  <td>{parseInt(tx.amount)}</td>
                  <td>{tx.freshness}</td>
                  <td>{tx.sender || 'N/A'}</td>
                  <td>{tx.sender_phone || 'N/A'}</td>
                  <td>
                    {tx.sender_email ? (
                      <a
                        href={`https://mail.google.com/mail/?view=cm&to=${tx.sender_email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {tx.sender_email}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{formatDateOnly(tx.expiry_date)}</td>
                  <td>{formatDateOnly(tx.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="9">No transactions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

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
          <Link to="/shared-ledger-distributor" className="active">SHARED LEDGER</Link>
          <Link to="/distributed-database-distributor">DISTRIBUTED DATABASE</Link>
        </nav>
        <Link to="/" className="logout" onClick={handleLogout}>LOGOUT ⤴</Link>
      </header>

      <main>
        <div className="welcome-section">
          <h2>Shared Ledger: Freshness & Transaction Data</h2>
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-box"
          />
          <div className="view-buttons">
            <button
              className={view === 'freshness' ? 'active' : ''}
              onClick={() => setView('freshness')}
            >
              View Freshness
            </button>
            <button
              className={view === 'transaction' ? 'active' : ''}
              onClick={() => setView('transaction')}
            >
              View Transactions
            </button>
          </div>
          {view === 'freshness' ? renderFreshnessTable() : renderTransactionTable()}
        </div>
      </main>
    </div>
  );
}

export default SharedLedgerDistributor;
