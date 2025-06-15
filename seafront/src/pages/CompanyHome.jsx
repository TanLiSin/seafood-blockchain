import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CompanyHome.css';

function CompanyHome() {
  const [companyName, setCompanyName] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const user_id = localStorage.getItem('user_id');

  // Fetch company name
  useEffect(() => {
    fetch(`${import.meta.env.VITE_NODE_API}/api/users`)
      .then((response) => response.json())
      .then((data) => {
        const company = data.find(user => user.role === 'Company') || data[0];
        setCompanyName(company?.username || 'Company');
      })
      .catch((error) => {
        console.error('Error fetching company name:', error);
        setCompanyName('Company');
      });
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
          <Link to="/company-home" className="active">HOME</Link>
          <Link to="/process-record">PROCESS RECORD</Link>
          <Link to="/transaction-company">TRANSACTION</Link>
          <Link to="/catch-record-company">CATCH RECORD</Link>
          <Link to="/trade-record">TRADE RECORD</Link>
          <Link to="/shared-ledger-company">SHARED LEDGER</Link>
          <Link to="/track-recall-company">TRACK & RECALL</Link>
        </nav>
        <Link to="/" className="logout" onClick={handleLogout}>LOGOUT ⤴</Link>
      </header>

      <main>
        <div className="banner">
          <img src="/pictures/process.png" alt="Process Record" />
          <Link to="/process-record" className="banner-text">
            Process Record Authentication
          </Link>
        </div>

        <div className="welcome-section">
          <h2>
            Welcome, {companyName} as Company!
          </h2>
          <div className="feature-boxes">
            <div className="feature">
              <img src="/pictures/transaction.png" alt="Transactions" />
              <Link to="/transaction-company"><button>Transactions</button></Link>
            </div>
            <div className="feature">
              <img src="/pictures/trade-record.png" alt="Trade Record" />
              <Link to="/trade-record"><button>Trade Record</button></Link>
            </div>
            <div className="feature">
              <img src="/pictures/catch.png" alt="Catch Record" />
              <Link to="/catch-record-company"><button>Catch Record</button></Link>
            </div>
            <div className="feature">
              <img src="/pictures/ledger.jpg" alt="Shared Ledger" />
              <Link to="/shared-ledger-company"><button>Shared Ledger</button></Link>
            </div>
            <div className="feature">
              <img src="/pictures/track-recall.png" alt="Track & Recall" />
              <Link to="/track-recall-company"><button>Track & Recall</button></Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CompanyHome;
