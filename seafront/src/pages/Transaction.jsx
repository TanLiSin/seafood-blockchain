import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SupplierHome.css';
import './CatchRecord.css';
import './Transaction.css';
import './Record.css';
import TransactionForm from './TransactionForm';
import './Search.css';
import confetti from 'canvas-confetti';

function Transaction() {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const user_id = localStorage.getItem('user_id');

  const fetchTransactions = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/transactions?userId=${userId}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  const confirmDelete = (txId) => {
    setTransactionToDelete(txId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await fetch(`${import.meta.env.VITE_NODE_API}/api/transactions/${transactionToDelete}`, {
        method: 'DELETE',
      });

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      setShowDeleteModal(false);
      setTransactionToDelete(null);
      setShowSuccessModal(true);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setShowDeleteModal(false);
      setShowErrorModal(true);
    }
  };

  useEffect(() => {
    fetchTransactions();
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const shortenTxId = (id) => {
    if (!id) return '';
    return id.slice(0, 10) + '...';
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const filteredTransactions = transactions.filter((tx) =>
    tx.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.end_user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())
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
          <Link to="/transaction" className="active">TRANSACTION</Link>
          <Link to="/catch-record">CATCH RECORD</Link>
          <Link to="/shared-ledger">SHARED LEDGER</Link>
          <Link to="/track-recall">TRACK & RECALL</Link>
        </nav>
        <Link to="/" className="logout" onClick={handleLogout}>LOGOUT ⤴</Link>
      </header>

      <main>
        <div className="welcome-section">
          <h2>Transaction Management</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by product ID, transaction ID or end user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => {
            setEditTx(null);
            setShowForm(!showForm);
          }} style={{ marginBottom: '20px' }}>
            {showForm ? 'Close Form' : 'Register New Transaction'}
          </button>

          {showForm ? (
            <TransactionForm
              onSubmitSuccess={fetchTransactions}
              editTx={editTx}
              onCancelEdit={() => setEditTx(null)}
            />
          ) : (
            <div className="record-table-container">
              <table className="record-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Product ID</th>
                    <th>Amount</th>
                    <th>Freshness</th>
                    <th>End User</th>
                    <th>Expiry Date</th>
                    <th>Date/Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{shortenTxId(tx.transaction_id)}</td>
                        <td>{tx.product_id}</td>
                        <td>{parseInt(tx.amount)}</td>
                        <td>{tx.freshness}</td>
                        <td>{tx.end_user}</td>
                        <td>{formatDateOnly(tx.expiry_date)}</td>
                        <td>{formatDateOnly(tx.created_at)}</td>
                        <td>
                          <button onClick={() => {
                            setEditTx(tx);
                            setShowForm(true);
                          }}>Edit</button>
                          <button onClick={() => confirmDelete(tx.id)} style={{ marginLeft: '5px' }}>Delete</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8">No transactions found.</td>
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
                <p>Are you sure you want to delete this transaction?</p>
                <button onClick={handleDeleteConfirmed}>Yes, Delete</button>
                <button className="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Error Modal */}
          {showErrorModal && (
            <div className="modal-overlay">
              <div className="modal-box error">
                <h2>❌ Failed to Delete</h2>
                <p>There was a problem deleting the transaction. Please try again later.</p>
                <button onClick={() => setShowErrorModal(false)}>OK</button>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="modal-overlay">
              <div className="modal-box success">
                <h2>✅ Transaction Deleted</h2>
                <p>The transaction has been successfully deleted!</p>
                <button onClick={() => setShowSuccessModal(false)}>OK</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Transaction;
