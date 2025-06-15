import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegulatoryHome.css';

function RegulatoryHome() {
  const [regulatoryName, setRegulatoryName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Replace the URL below with your actual backend endpoint
    fetch(`${import.meta.env.VITE_NODE_API}/api/users`)
      .then((response) => response.json())
      .then((data) => {
        // If user login is not implemented yet, just use the first user as placeholder
        const regulatory = data.find(user => user.role === 'Regulatory') || data[0];
        setRegulatoryName(regulatory?.username || 'Regulatory');
      })
      .catch((error) => {
        console.error('Error fetching regulatory name:', error);
        setRegulatoryName('Regulatory'); // fallback name
      });
  }, []);

  function handleLogout() {
    localStorage.clear(); // ✅ Clear all stored user data
    navigate('/'); // 🔄 Redirect to login or home
  }

  return (
    <div className="regulatory-page">
      <header>
        <div className="left-section">
          <span className="notify-icon">🔔</span>
          <h1 className="brand">REGULATORY</h1>
        </div>
        <nav className="nav-links">
          <Link to="/regulatory-home" className="active">HOME</Link>
          <Link to="/process-record-regulatory">PROCESS RECORD</Link>
          <Link to="/catch-record-regulatory">CATCH RECORD</Link>
          <Link to="/trade-record-regulatory">TRADE RECORD</Link>
          <Link to="/shared-ledger-regulatory">SHARED LEDGER</Link>
          <Link to="/distributed-database-regulatory">DISTRIBUTED DATABASE</Link>
        </nav>
        <Link to="/" className="logout" onClick={handleLogout}>LOGOUT ⤴</Link>
      </header>

      <main>
        <div className="banner">
          <img src="/pictures/ledger.jpg" alt="Shared Ledger" />
          <Link to="/shared-ledger-regulatory" className="banner-text">
            Shared Ledger
          </Link>
        </div>

        <div className="welcome-section">
          <h2>
            Welcome, {regulatoryName} as Regulatory!
          </h2>
          <div className="feature-boxes">
            <div className="feature">
              <img src="/pictures/process.png" alt="Process Record"/>
              <Link to="/process-record-regulatory"><button>Process Record</button></Link>
            </div>
            <div className="feature">
              <img src="/pictures/trade-record.png" alt="Trade Record" />
              <Link to="/trade-record-regulatory"><button>Trade Record</button></Link>
            </div>
            <div className="feature">
              <img src="/pictures/catch.png" alt="Catch Record" />
              <Link to="/catch-record-regulatory"><button>Catch Record</button></Link>
            </div>
            <div className="feature">
              <img src="/pictures/database.png" alt="Distributed Database" />
              <Link to="/distributed-database-regulatory"><button>Distributed Database</button></Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RegulatoryHome;
