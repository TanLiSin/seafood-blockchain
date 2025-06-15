import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './CompanyHome.css';
import './CatchRecord.css';
import './Transaction.css';
import './Search.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function TrackRecallCompany() {
  const [transactions, setTransactions] = useState([]);
  const [viewMode, setViewMode] = useState('sender');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [currentTxId, setCurrentTxId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);
  const [allFeedback, setAllFeedback] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showCharts, setShowCharts] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const formatDateOnly = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const fetchTransactions = async (mode = 'sender') => {
    try {
      const username = localStorage.getItem('username');
      const companyName = localStorage.getItem('username');
    let url;
    if (mode === 'receiver') {
      url = `${import.meta.env.VITE_NODE_API}/api/transactions-company-receiver?companyName=${encodeURIComponent(companyName)}`;
    } else {
      url = `${import.meta.env.VITE_NODE_API}/api/transactions-company-sender?companyName=${encodeURIComponent(companyName)}`;
    }
    const response = await fetch(url);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  useEffect(() => {
    fetchTransactions('sender');
    fetchAllFeedback();
    fetchNotifications();
  }, []);

  const openFeedbackModal = async (txId) => {
    setCurrentTxId(txId);
    setFeedback('');
    setEditingId(null);
    setFeedbackModalOpen(true);
    const res = await fetch(`${import.meta.env.VITE_NODE_API}/api/feedback/${txId}`);
    const data = await res.json();
    setFeedbackList(data);
  };

  const submitFeedback = async () => {
    const user_id = localStorage.getItem('user_id');
  
    // Save feedback
    await fetch(`${import.meta.env.VITE_NODE_API}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction_id: currentTxId,
        user_id,
        comment: feedback
      })
    });
  
    // Notify sender or end user based on viewMode
    const notifyEndpoint =
      viewMode === 'receiver'
        ? `${import.meta.env.VITE_NODE_API}/api/notify-sender`
        : `${import.meta.env.VITE_NODE_API}/api/notify-enduser`;
  
    await fetch(notifyEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction_id: currentTxId,
        comment: feedback
      })
    });
  
    await openFeedbackModal(currentTxId);
  };  
  
  const fetchAllFeedback = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_NODE_API}/api/feedback`);
      const data = await res.json();
      setAllFeedback(data);
    } catch (error) {
      console.error('Error fetching all feedback:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const user_id = localStorage.getItem('user_id');
      const res = await fetch(`${import.meta.env.VITE_NODE_API}/api/notifications?user_id=${user_id}`);
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${import.meta.env.VITE_NODE_API}/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const updateFeedback = async () => {
    const user_id = localStorage.getItem('user_id');
    if (!editingId) return;
    await fetch(`${import.meta.env.VITE_NODE_API}/api/feedback/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: feedback, user_id })
    });
    setFeedback('');
    setEditingId(null);
    await openFeedbackModal(currentTxId);
  };

  const filteredTransactions = transactions.filter((tx) =>
    Object.values(tx).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Freshness chart data
  const freshnessCounts = transactions.reduce((acc, tx) => {
    const category = tx.freshness || 'Unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const freshnessChartData = {
    labels: Object.keys(freshnessCounts),
    datasets: [{
      label: 'Freshness Distribution',
      data: Object.values(freshnessCounts),
      backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d'],
      borderWidth: 1
    }]
  };

// Get all transaction IDs shown in this view
const txIds = transactions.map(tx => tx.transaction_id);

// Filter feedback linked to these transactions only
const feedbackForCurrentTxs = allFeedback.filter(f => txIds.includes(f.transaction_id));

// Identify relevant users based on view mode (sender or receiver)
const relevantUsers = viewMode === 'receiver'
  ? [...new Set(transactions.map(tx => tx.sender))]
  : [...new Set(transactions.map(tx => tx.end_user))];

// Slice feedback into matching and non-matching users
const relevantFeedback = feedbackForCurrentTxs.filter(f => relevantUsers.includes(f.username));
const otherFeedback = feedbackForCurrentTxs.filter(f => !relevantUsers.includes(f.username));

const feedbackChartData = {
  labels: [
    `${viewMode === 'receiver' ? 'Sender' : 'End User'} (${[...new Set(relevantFeedback.map(f => f.username))].join(', ') || 'N/A'})`,
    `You (${[...new Set(otherFeedback.map(f => f.username))].join(', ') || 'N/A'})`
  ],
  datasets: [{
    data: [relevantFeedback.length, otherFeedback.length],
    backgroundColor: ['#0074d9', '#999'],
    borderWidth: 1
  }]
};

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
        <div className="welcome-section">
          <h2>Track & Recall</h2>
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => { setViewMode('sender'); fetchTransactions('sender'); }}
              style={{
                marginRight: '0.5rem',
                padding: '0.5rem 1.5rem',
                backgroundColor: viewMode === 'sender' ? '#1a1a1a' : '#ccc',
                color: 'white',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              View Sender
            </button>
            <button
              onClick={() => { setViewMode('receiver'); fetchTransactions('receiver'); }}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: viewMode === 'receiver' ? '#1a1a1a' : '#ccc',
                color: 'white',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              View Receiver
            </button>
          </div>
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-box"
          />

          <div className="record-table-container">
            <table className="record-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Product ID</th>
                  <th>Amount</th>
                  <th>Freshness</th>
                  <th>{viewMode === 'receiver' ? 'Sender' : 'End User'}</th>
                  <th>Phone No</th>
                  <th>Email</th>
                  <th>Expiry Date</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.transaction_id.slice(0, 6) + '...'}</td>
                      <td>{tx.product_id}</td>
                      <td>{parseInt(tx.amount)}</td>
                      <td>{tx.freshness}</td>
                      <td>{viewMode === 'receiver' ? tx.sender || 'N/A' : tx.end_user || 'N/A'}</td>
                      <td>{viewMode === 'receiver' ? tx.sender_phone || 'N/A' : tx.end_user_phone || 'N/A'}</td>
                      <td>
                        {(viewMode === 'receiver' ? tx.sender_email : tx.end_user_email) ? (
                          <a
                            href={`https://mail.google.com/mail/?view=cm&to=${viewMode === 'receiver' ? tx.sender_email : tx.end_user_email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {viewMode === 'receiver' ? tx.sender_email : tx.end_user_email}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td>{formatDateOnly(tx.expiry_date)}</td>
                      <td>{formatDateOnly(tx.created_at)}</td>
                      <td>
                        <button
                          onClick={() => openFeedbackModal(tx.transaction_id)}
                          style={{
                            backgroundColor: '#0074d9',
                            color: 'white',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Feedback
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="10">No transactions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Toggle Charts */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              onClick={() => setShowCharts(!showCharts)}
              style={{
                padding: '10px 20px',
                backgroundColor: showCharts ? '#dc3545' : '#0074d9',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {showCharts ? 'Hide Charts' : 'Show Charts'}
            </button>
          </div>

          {showCharts && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <div style={{ width: '400px', textAlign: 'center' }}>
                <h3>Freshness Distribution</h3>
                <Pie data={freshnessChartData} />
              </div>
              <div style={{ width: '400px', textAlign: 'center' }}>
                <h3>Feedback Ratio: Sender / End User vs You</h3>
                <Pie data={feedbackChartData} />
              </div>
            </div>
          )}
        </div>
      </main>

      {feedbackModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '900px', width: '90%', padding: '2rem', borderRadius: '16px', display: 'flex', gap: '2rem', backgroundColor: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', maxHeight: '90vh' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#0074d9', marginBottom: '1rem' }}>Feedback for Transaction</h3>
              <p><strong>ID:</strong> <span>{currentTxId.slice(0, 20) + '...'}</span></p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your comment here..."
                style={{ width: '100%', height: '120px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '1rem' }}
              />
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                {editingId ? (
                  <button
                    onClick={async () => {
                      await updateFeedback();
                      setFeedback('');
                      setEditingId(null);
                    }}
                    style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', marginRight: '10px', fontWeight: 'bold' }}
                  >
                    Save Edit
                  </button>
                ) : (
                  <button
                    onClick={submitFeedback}
                    style={{ padding: '8px 16px', backgroundColor: '#0074d9', color: '#fff', border: 'none', borderRadius: '6px', marginRight: '10px', fontWeight: 'bold' }}
                  >
                    Submit
                  </button>
                )}
                <button
                  onClick={() => { setFeedbackModalOpen(false); setFeedback(''); setEditingId(null); }}
                  style={{ padding: '8px 16px', backgroundColor: '#bbb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}
                >
                  Close
                </button>
              </div>
            </div>

            <div style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '1rem' }}>
              <h4 style={{ fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>Previous Comments</h4>
              <div>
                {feedbackList.map((f, i) => (
                  <div
                    key={i}
                    style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: f.id === editingId ? '#e9f5ff' : '#f9f9f9', borderRadius: '6px', cursor: f.user_id === localStorage.getItem('user_id') ? 'pointer' : 'default' }}
                    onClick={() => {
                      if (f.user_id === localStorage.getItem('user_id')) {
                        setFeedback(f.comment);
                        setEditingId(f.id);
                      }
                    }}
                  >
                    <strong>{f.username}</strong> ({formatDateOnly(f.created_at)})<br />
                    <span style={{ display: 'block', marginTop: '4px' }}>{f.comment}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackRecallCompany;
