import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './RegulatoryHome.css';
import './CatchRecord.css';
import './Search.css';

function CatchRecordRegulatory() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all catch records
  async function fetchData() {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/catch-records`);
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

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  // Filter the records based on search term
  const filteredRecords = records.filter((record) =>
    record.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Link to="/catch-record-regulatory" className="active">CATCH RECORD</Link>
          <Link to="/trade-record-regulatory">TRADE RECORD</Link>
          <Link to="/shared-ledger-regulatory">SHARED LEDGER</Link>
          <Link to="/distributed-database-regulatory">DISTRIBUTED DATABASE</Link>
        </nav>
        <Link to="/" className="logout" onClick={handleLogout}>LOGOUT ⤴</Link>
      </header>

      <main>
        <div className="welcome-section">
          <h2>Catch Record: View All Records</h2>
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
                    <td colSpan="6">No records found.</td>
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

export default CatchRecordRegulatory;
