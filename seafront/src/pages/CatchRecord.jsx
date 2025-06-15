import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SupplierHome.css';
import './CatchRecord.css';
import './Record.css';
import './Search.css';
import CatchRecordForm from './CatchRecordForm';
import confetti from 'canvas-confetti';

function CatchRecord() {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const user_id = localStorage.getItem('user_id');

  const fetchData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/catch-records`);
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecords([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

    // Fetch notifications
    const fetchNotifications = async () => {
      if (!user_id) return;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications?user_id=${user_id}`);
      const data = await res.json();
      setNotifications(data);
    };
  
    useEffect(() => {
      fetchNotifications();
    }, [user_id]);
  
    // Mark notification as read
    const markAsRead = async (id) => {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PATCH'
      });
      fetchNotifications();
    };
  
    const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    setShowForm(true);
  };

  const confirmDelete = (productId) => {
    setRecordToDelete(productId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/catch-records/${recordToDelete}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        setShowDeleteModal(false);
        setRecordToDelete(null);
        setShowSuccessModal(true);
        fetchData();
      } else {
        console.error(data.error);
        setShowDeleteModal(false);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error(error);
      setShowDeleteModal(false);
      setShowErrorModal(true);
    }
  };

  const filteredRecords = records.filter((record) =>
    record.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.freshness_label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="supplier-page">
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
            <h1 className="brand">SUPPLIER</h1>
          </div>
        <nav className="nav-links">
          <Link to="/supplier-home">HOME</Link>
          <Link to="/transaction">TRANSACTION</Link>
          <Link to="/catch-record" className="active">CATCH RECORD</Link>
          <Link to="/shared-ledger">SHARED LEDGER</Link>
          <Link to="/track-recall">TRACK & RECALL</Link>
        </nav>
        <Link to="/" className="logout" onClick={handleLogout}>LOGOUT ⤴</Link>
      </header>

      <main>
        <div className="welcome-section">
          <h2>Catch Record Management</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by product ID, name, or freshness..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => {
            setEditRecord(null);
            setShowForm(!showForm);
          }} style={{ marginBottom: '20px' }}>
            {showForm ? 'Close Form' : 'Register New Record'}
          </button>

          {showForm ? (
            <CatchRecordForm
              onSubmitSuccess={fetchData}
              recordToEdit={editRecord}
              onCancel={() => {
                setEditRecord(null);
                setShowForm(false);
              }}
            />
          ) : (
            <div className="record-table-container">
              <table className="record-table">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Product</th>
                    <th>Weight (kg)</th>
                    <th>Date/Time Saved</th>
                    <th>Origin</th>
                    <th>Freshness</th>
                    <th>Actions</th>
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
                        <td>
                          <button onClick={() => handleEdit(record)}>Edit</button>
                          <button onClick={() => confirmDelete(record.product_id)} style={{ marginLeft: '5px' }}>Delete</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="modal-overlay">
              <div className="modal-box warning">
                <h2>⚠️ Confirm Deletion</h2>
                <p>Are you sure you want to delete this catch record?</p>
                <button onClick={handleDeleteConfirmed}>Yes, Delete</button>
                <button className="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Error Modal */}
          {showErrorModal && (
            <div className="modal-overlay">
              <div className="modal-box error">
                <h2>❌ Delete Failed</h2>
                <p>There was an issue deleting the record. Please try again.</p>
                <button onClick={() => setShowErrorModal(false)}>OK</button>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="modal-overlay">
              <div className="modal-box success">
                <h2>✅ Record Deleted</h2>
                <p>The catch record has been successfully deleted!</p>
                <button onClick={() => setShowSuccessModal(false)}>OK</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CatchRecord;
