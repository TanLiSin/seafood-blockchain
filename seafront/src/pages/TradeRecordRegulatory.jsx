import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './RegulatoryHome.css';
import './TradeRecord.css';
import './Search.css';

function TradeRecordRegulatory() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all certificates along with company details
  async function fetchData() {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/company-certificates`);
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
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

  // Filter records by product name, company name, or email
  const filteredRecords = records.filter((record) =>
    record.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.company_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.company_phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isImage = (filename) => /\.(jpg|jpeg|png)$/i.test(filename);

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
          <Link to="/trade-record-regulatory" className="active">TRADE RECORD</Link>
          <Link to="/shared-ledger-regulatory">SHARED LEDGER</Link>
          <Link to="/distributed-database-regulatory">DISTRIBUTED DATABASE</Link>
        </nav>
        <Link to="/" className="logout" onClick={handleLogout}>LOGOUT ⤴</Link>
      </header>

      <main>
        <div className="welcome-section">
          <h2>All Trade Certificates</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by company name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="record-table-container">
            <table className="record-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Certificate</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record, index) => {
                    const fileUrl = `${import.meta.env.VITE_NODE_API}/uploads/company-certificates/${record.license}`;
                    return (
                      <tr key={index}>
                        <td>{record.company_name}</td>
                        <td>{record.company_phone}</td>
                        <td>
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${record.company_email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'blue', textDecoration: 'underline' }}
                          >
                            {record.company_email}
                          </a>
                        </td>
                        <td>
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'black'}}
                          >
                            {record.license}
                          </a>
                        </td>
                        <td>
                          <a
                            href={fileUrl}
                            download
                            className="download-button"
                            style={{
                              padding: '5px 10px',
                              background: '#3498db',
                              color: '#fff',
                              borderRadius: '5px',
                              textDecoration: 'none'
                            }}
                          >
                            Download
                          </a>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5">No trade certificates found.</td>
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

export default TradeRecordRegulatory;
