import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CompanyHome.css';
import './CatchRecord.css';
import './Search.css';

function CatchRecordCompany() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // ✅ Added search term state
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const user_id = localStorage.getItem('user_id');

  const companyName = localStorage.getItem('username');

  // Fetch only the catch records linked to transactions where the company received the product
  async function fetchData() {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/company-received-records?companyName=${companyName}`);
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecords([]);
    }
  }

  useEffect(() => {
    fetchData();
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

  // Filter records based on search term
  const filteredRecords = records.filter((record) =>
    record.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="company-page">
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
            <h1 className="brand">COMPANY</h1>
          </div>
        <nav className="nav-links">
          <Link to="/company-home">HOME</Link>
          <Link to="/process-record">PROCESS RECORD</Link>          
          <Link to="/transaction-company">TRANSACTION</Link>
          <Link to="/catch-record-company" className="active">CATCH RECORD</Link>
          <Link to="/trade-record">TRADE RECORD</Link>
          <Link to="/shared-ledger-company">SHARED LEDGER</Link>
          <Link to="/track-recall-company">TRACK & RECALL</Link>
        </nav>
        <Link to="/" className="logout" onClick={handleLogout}>LOGOUT ⤴</Link>
      </header>

      <main>
        <div className="welcome-section">
          <h2>Catch Record: View Only Your Supplier-Linked Records</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by product ID, name, or origin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="record-table-container">
            <table className="record-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product</th>
                  <th>Weight (kg)</th>
                  <th>Date Saved</th>
                  <th>Origin</th>
                  <th>Freshness</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record, index) => (
                    <tr key={index}>
                      <td>{record.product_id}</td>
                      <td>{record.product_name}</td>
                      <td>{record.quantity}</td>
                      <td>{new Date(record.created_at).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                          }).replace(',', ', ')}</td>
                      <td>{record.source}</td>
                      <td>{record.freshness_label || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No linked records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CatchRecordCompany;
