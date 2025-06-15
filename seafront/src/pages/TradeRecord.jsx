import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CompanyHome.css';
import './TradeRecord.css'; 
function TradeRecord() {
  const [certificateFile, setCertificateFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [licenseFile, setLicenseFile] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const user_id = localStorage.getItem('user_id');

  const handleFileChange = (e) => {
    setCertificateFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!certificateFile) {
      alert('Please select a certificate file.');
      return;
    }

    const formData = new FormData();
    formData.append('license', certificateFile);
    formData.append('userId', localStorage.getItem('user_id'));

    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/upload-certificate`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('Certificate uploaded and stored successfully!');
        fetchLicenseFile();
      } else {
        setUploadStatus('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading certificate:', error);
      setUploadStatus('Error occurred during upload.');
    }
  };

  const fetchLicenseFile = async () => {
    const userId = localStorage.getItem('user_id');
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/users/${userId}`);
      const data = await response.json();
      setLicenseFile(data.license);
    } catch (error) {
      console.error('Error fetching license:', error);
    }
  };

  useEffect(() => {
    fetchLicenseFile();
  }, []);

  const isImage = (filename) => /\.(jpg|jpeg|png)$/i.test(filename);

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

  const fileUrl = licenseFile
    ? `${import.meta.env.VITE_NODE_API}/uploads/company-certificates/${licenseFile}`
    : '';

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
          <Link to="/catch-record-company">CATCH RECORD</Link>
          <Link to="/trade-record" className="active">TRADE RECORD</Link>
          <Link to="/shared-ledger-company">SHARED LEDGER</Link>
          <Link to="/track-recall-company">TRACK & RECALL</Link>
        </nav>
        <Link to="/" className="logout" onClick={handleLogout}>LOGOUT ⤴</Link>
      </header>

      <main>
        <div className="welcome-section">
          <h2>Trade Record</h2>

          <form onSubmit={handleUpload} className="upload-form">
            <label htmlFor="certificateFile">Select Certificate (PDF/JPG/PNG):</label>
            <input
              type="file"
              id="certificateFile"
              accept=".pdf,.jpg,.png"
              onChange={handleFileChange}
              className="file-input"
            />
            <button type="submit" className="upload-button">Upload Certificate</button>
          </form>

          {uploadStatus && <p className="status-message">{uploadStatus}</p>}

          {licenseFile && (
            <div className="certificate-preview">
              <h3>Uploaded Certificate Preview:</h3>
              {isImage(licenseFile) ? (
                <img
                  src={fileUrl}
                  alt="Certificate"
                  className="certificate-image"
                />
              ) : (
                <div className="pdf-container">
                  <iframe
                    src={fileUrl}
                    width="100%"
                    height="500"
                    title="Certificate PDF"
                  />
                </div>
              )}

              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="view-link"
              >
                View in New Tab
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default TradeRecord;
