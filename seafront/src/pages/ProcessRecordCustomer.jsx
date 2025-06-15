import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './CatchRecordCustomer';
import './CatchRecord.css';
import './Search.css';

function ProcessRecordCustomer() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all process records
  async function fetchData() {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/process-records`);
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching process records:', error);
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

  // Filter records based on search term
  const filteredRecords = records.filter((record) =>
    record.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customer-page">
      <header>
        <div className="left-section">
          <span className="notify-icon">🔔</span>
          <h1 className="brand">CUSTOMER</h1>
        </div>
        <nav className="nav-links">
          <Link to="/customer-home">HOME</Link>
          <Link to="/process-record-customer" className="active">PROCESS RECORD</Link>
          <Link to="/catch-record-customer">CATCH RECORD</Link>
          <Link to="/shared-ledger-customer">SHARED LEDGER</Link>
        </nav>
        <Link to="/" className="logout" onClick={handleLogout}>LOGOUT ⤴</Link>
      </header>

      <main>
        <div className="welcome-section">
          <h2>Process Record: View All Records</h2>
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
                  <th>Process Method</th>
                  <th>Date/Time Saved</th>
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
                      <td>{record.process_method}</td>
                      <td>{new Date(record.created_at).toLocaleString()}</td>
                      <td>{record.source}</td>
                      <td>{record.freshness_label || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No process records found.</td>
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

export default ProcessRecordCustomer;
