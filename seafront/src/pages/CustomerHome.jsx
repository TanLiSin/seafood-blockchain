import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CustomerHome.css';

function CustomerHome() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  return (
    <div className="customer-page">
      <header>
        <div className="left-section">
          <span className="notify-icon">🔔</span>
          <h1 className="brand">CUSTOMER</h1>
        </div>
        <nav className="nav-links">
          <Link to="/customer-home" className="active">HOME</Link>
          <Link to="/process-record-customer">PROCESS RECORD</Link>
          <Link to="/catch-record-customer">CATCH RECORD</Link>
          <Link to="/shared-ledger-customer">SHARED LEDGER</Link>
        </nav>
        <Link to="/" className="logout" onClick={handleLogout}>LOGOUT ⤴</Link>
      </header>

      <main>
        <div className="banner">
          <img src="/pictures/ledger.jpg" alt="Shared Ledger" />
          <div className="banner-text">Shared Ledger</div>
        </div>

        <div className="welcome-section">
          <h2>Welcome, valued customer!</h2>
          <div className="feature-boxes">
            <div className="feature">
              <img src="/pictures/process.png" alt="Process Record" />
              <Link to="/process-record-customer"><button>View Process Record</button></Link>
            </div>
            <div className="feature">
              <img src="/pictures/catch.png" alt="Catch Record" />
              <Link to="/catch-record-customer"><button>View Catch Record</button></Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CustomerHome;
