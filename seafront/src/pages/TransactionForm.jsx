
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './SupplierHome.css';
import './CatchRecord.css';
import './Record.css';

function BalanceModal({ balance, onClose }) {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-box success">
        <h2>✅ Transaction Successful</h2>
        <p>Your remaining Algo token balance:</p>
        <h3>{balance} Algos</h3>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function ConfirmationModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box confirm">
        <h2>📝 Confirm Submission</h2>
        <p>Are you sure you want to submit this transaction?</p>
        <button onClick={onConfirm}>Yes, Submit</button>
        <button onClick={onCancel} style={{ backgroundColor: 'gray', color: 'white' }}>Cancel</button>
      </div>
    </div>
  );
}

function ErrorModal({ title, message, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box warning">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

function TransactionForm({ onSubmitSuccess, editTx, onCancelEdit }) {
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    productId: '',
    freshness: '',
    amount: '',
    expiryDate: '',
    endUser: '',
    endUserWallet: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);
  const [algoBalance, setAlgoBalance] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    const supplierId = localStorage.getItem('user_id');

    fetch(`${import.meta.env.VITE_NODE_API}/api/catch-records?supplierId=${supplierId}`)
      .then((res) => res.json())
      .then(setProducts)
      .catch(console.error);

    fetch(`${import.meta.env.VITE_NODE_API}/api/companies`)
      .then((res) => res.json())
      .then(setCompanies)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (editTx) {
      const expiryDateFormatted = editTx.expiry_date
        ? new Date(editTx.expiry_date).toISOString().split('T')[0]
        : '';
      setForm({
        productId: editTx.product_id || '',
        freshness: editTx.freshness || '',
        amount: editTx.amount || '',
        expiryDate: expiryDateFormatted,
        endUser: editTx.end_user || '',
        endUserWallet: '',
      });
    } else {
      setForm({
        productId: '',
        freshness: '',
        amount: '',
        expiryDate: '',
        endUser: '',
        endUserWallet: '',
      });
    }
  }, [editTx]);

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const product = products.find((p) => p.product_id === productId);
    setForm({ ...form, productId, freshness: product?.freshness_label || '' });
  };

  const handleCompanySelect = (e) => {
    const username = e.target.value;
    const selectedCompany = companies.find((c) => c.username === username);
    setForm({
      ...form,
      endUser: username,
      endUserWallet: selectedCompany?.wallet_address || '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmModalVisible(true);
  };

  const proceedSubmit = async () => {
    setConfirmModalVisible(false);
    setIsSubmitting(true);

    try {
      if (editTx) {
        await fetch(`${import.meta.env.VITE_NODE_API}/api/transactions/${editTx.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: form.productId,
            freshness: form.freshness,
            amount: parseInt(form.amount),
            expiry_date: form.expiryDate,
            end_user: form.endUser,
          }),
        });
        window.location.href = '/transaction';
      } else {
        const res = await fetch(`${import.meta.env.VITE_FASTAPI_API}/api/create-transaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mnemonic: localStorage.getItem('mnemonic'),
            user_id: localStorage.getItem('user_id'),
            product_id: form.productId,
            freshness: form.freshness,
            amount: parseInt(form.amount),
            expiry_date: form.expiryDate,
            end_user: form.endUser,
            end_user_wallet: form.endUserWallet,
          }),
        });

        const data = await res.json();

        if (data.status === 'success' && data.tx_id) {
          const walletAddress = localStorage.getItem('wallet_address');
          try {
            const balResponse = await fetch(`${import.meta.env.VITE_NODE_API}/api/balance?address=${walletAddress}`);
            const balData = await balResponse.json();
            if (balData.status === 'success') {
              const algo = (parseInt(balData.balance) / 1_000_000).toFixed(3);
              setAlgoBalance(algo);
              setBalanceModalVisible(true);
              return; // ✅ stop here to show modal
            }
          } catch {
            console.warn("⚠️ Could not fetch balance");
          }
          // fallback if balance fetch fails
          window.location.href = '/transaction';
        }
         else {
          if (data.error && data.error.includes("Insufficient ALGO balance")) {
            const algo = (parseInt(data.wallet_balance || 0) / 1_000_000).toFixed(3);
            setErrorModal({
              title: '❌ Not Enough ALGO',
              message: `Your wallet balance is too low to perform this transaction. Current balance: ${algo} Algos. Please top up and try again.`
            });
          } else {
            setErrorModal({ title: '❌ Blockchain Error', message: 'Transaction failed to be processed.' });
          }
        }
      }
    } catch (err) {
      console.error(err);
      setErrorModal({ title: '❌ Network Error', message: 'A network error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-grid">
        <label>Product ID:</label>
        <select name="productId" value={form.productId} onChange={handleProductSelect} required>
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.product_id} value={p.product_id}>
              {p.product_id} - {p.product_name}
            </option>
          ))}
        </select>

        {form.freshness && <p>Freshness: {form.freshness}</p>}

        <label>Amount:</label>
        <input type="number" name="amount" value={form.amount} onChange={handleChange} required />

        <label>Expiry Date:</label>
        <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} required />

        <label>End User (Company):</label>
        <select name="endUser" value={form.endUser} onChange={handleCompanySelect} required>
          <option value="">Select Company</option>
          {companies.map((c) => (
            <option key={c.user_id} value={c.username}>
              {c.username}
            </option>
          ))}
        </select>

        

        <div style={{ marginTop: '10px' }}>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : (editTx ? 'Update Transaction' : 'Submit Transaction')}
          </button>
        </div>
      </form>

      {confirmModalVisible && <ConfirmationModal onConfirm={proceedSubmit} onCancel={() => setConfirmModalVisible(false)} />}
      {errorModal && <ErrorModal title={errorModal.title} message={errorModal.message} onClose={() => setErrorModal(null)} />}
      {balanceModalVisible && (
        <BalanceModal
          balance={algoBalance}
          onClose={() => {
            setBalanceModalVisible(false);
            onSubmitSuccess();       // ✅ Refresh list
            onCancelEdit();          // ✅ Hide form
          }}
        />
      )}
    </div>
  );
}

export default TransactionForm;
