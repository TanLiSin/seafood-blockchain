import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './CustomerHome.css';
import './CatchRecord.css';
import './Search.css';

function SharedLedgerCustomer() {
  const [view, setView] = useState('freshness');
  const [freshnessView, setFreshnessView] = useState('all');
  const [transactionView, setTransactionView] = useState('all');

  const [catchRecords, setCatchRecords] = useState([]);
  const [companyFreshness, setCompanyFreshness] = useState([]);
  const [supplierFreshness, setSupplierFreshness] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [companyTransactions, setCompanyTransactions] = useState([]);
  const [supplierTransactions, setSupplierTransactions] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');

  const formatDateOnly = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const fetchFreshnessRecords = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/freshness-records`);
      const data = await response.json();
      setCatchRecords(data);
    } catch (error) {
      console.error('Error fetching freshness:', error);
      setCatchRecords([]);
    }
  };

  const fetchCompanyFreshness = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/company-freshness-records`);
      const data = await response.json();
      setCompanyFreshness(data);
    } catch (error) {
      console.error('Error fetching company freshness:', error);
      setCompanyFreshness([]);
    }
  };

  const fetchSupplierFreshness = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/supplier-freshness-records`);
      const data = await response.json();
      setSupplierFreshness(data);
    } catch (error) {
      console.error('Error fetching supplier freshness:', error);
      setSupplierFreshness([]);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/transactions`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  const fetchCompanyTransactions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/company-transactions`);
      const data = await response.json();
      setCompanyTransactions(data);
    } catch (error) {
      console.error('Error fetching company transactions:', error);
      setCompanyTransactions([]);
    }
  };

  const fetchSupplierTransactions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/supplier-transactions`);
      const data = await response.json();
      setSupplierTransactions(data);
    } catch (error) {
      console.error('Error fetching supplier transactions:', error);
      setSupplierTransactions([]);
    }
  };

  useEffect(() => {
    fetchFreshnessRecords();
    fetchCompanyFreshness();
    fetchSupplierFreshness();
    fetchTransactions();
    fetchCompanyTransactions();
    fetchSupplierTransactions();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const filterData = (data) => {
    if (!searchTerm) return data;
    return data.filter((record) =>
      Object.values(record).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const renderFreshnessTable = () => {
    let data = [];
    if (freshnessView === 'all') data = catchRecords;
    if (freshnessView === 'company') data = companyFreshness;
    if (freshnessView === 'supplier') data = supplierFreshness;

    const filteredData = filterData(data);

    return (
      <div className="record-table-container">
        <table className="record-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Weight (kg)</th>
              <th>Date</th>
              <th>Dissolved Oxygen</th>
              <th>Temperature</th>
              <th>pH Level</th>
              <th>Ammonia</th>
              <th>Metals</th>
              <th>Bacteria</th>
              <th>Freshness Score</th>
              <th>Freshness Label</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((record) => (
                <tr key={record.id}>
                  <td>{record.product_id}</td>
                  <td>{record.quantity}</td>
                  <td>{formatDateOnly(record.created_at)}</td>
                  <td>{record.dissolved_oxygen}</td>
                  <td>{record.temperature}</td>
                  <td>{record.ph_level}</td>
                  <td>{record.ammonia}</td>
                  <td>{record.metals}</td>
                  <td>{record.bacteria}</td>
                  <td>{record.freshness_score}</td>
                  <td>{record.freshness_label}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="11">No freshness records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTransactionTable = () => {
    let data = [];
    if (transactionView === 'all') data = transactions;
    if (transactionView === 'company') data = companyTransactions;
    if (transactionView === 'supplier') data = supplierTransactions;

    const filteredData = filterData(data);

    return (
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
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.transaction_id}</td>
                  <td>{tx.product_id}</td>
                  <td>{parseInt(tx.amount)}</td>
                  <td>{tx.freshness}</td>
                  <td>{tx.end_user}</td>
                  <td>{formatDateOnly(tx.expiry_date)}</td>
                  <td>{formatDateOnly(tx.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7">No transactions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="customer-page">
      <header>
        <div className="left-section">
          <span className="notify-icon">🔔</span>
          <h1 className="brand">CUSTOMER</h1>
        </div>
        <nav className="nav-links">
          <Link to="/customer-home">HOME</Link>
          <Link to="/process-record-customer">PROCESS RECORD</Link>
          <Link to="/catch-record-customer">CATCH RECORD</Link>
          <Link to="/shared-ledger-customer" className="active">SHARED LEDGER</Link>
        </nav>
        <Link to="/" className="logout" onClick={handleLogout}>LOGOUT ⤴</Link>
      </header>

      <main>
        <div className="welcome-section">
          <h2>Shared Ledger - Customer View</h2>

          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-box"
          />

          <div className="view-buttons">
            <button
              className={view === 'freshness' ? 'active' : ''}
              onClick={() => setView('freshness')}
            >
              View Freshness
            </button>
            <button
              className={view === 'transaction' ? 'active' : ''}
              onClick={() => setView('transaction')}
            >
              View Transaction
            </button>
          </div>

          {view === 'freshness' && (
            <>
              <div className="view-buttons" style={{ marginTop: '1rem' }}>
                <button
                  className={freshnessView === 'all' ? 'active' : ''}
                  onClick={() => setFreshnessView('all')}
                >
                  Show All
                </button>
                <button
                  className={freshnessView === 'company' ? 'active' : ''}
                  onClick={() => setFreshnessView('company')}
                >
                  Show Company
                </button>
                <button
                  className={freshnessView === 'supplier' ? 'active' : ''}
                  onClick={() => setFreshnessView('supplier')}
                >
                  Show Supplier
                </button>
              </div>
              {renderFreshnessTable()}
            </>
          )}

          {view === 'transaction' && (
            <>
              <div className="view-buttons" style={{ marginTop: '1rem' }}>
                <button
                  className={transactionView === 'all' ? 'active' : ''}
                  onClick={() => setTransactionView('all')}
                >
                  Show All
                </button>
                <button
                  className={transactionView === 'company' ? 'active' : ''}
                  onClick={() => setTransactionView('company')}
                >
                  Show Company
                </button>
                <button
                  className={transactionView === 'supplier' ? 'active' : ''}
                  onClick={() => setTransactionView('supplier')}
                >
                  Show Supplier
                </button>
              </div>
              {renderTransactionTable()}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default SharedLedgerCustomer;
