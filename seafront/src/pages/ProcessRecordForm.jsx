import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './CompanyHome.css';
import './CatchRecord.css';

function BalanceModal({ balance, onClose }) {
  useEffect(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }, []);
  return (
    <div className="modal-overlay">
      <div className="modal-box success">
        <h2>✅ Submission Successful</h2>
        <p>Your remaining Algo token balance:</p>
        <h3>{balance} Algos</h3>
        <button onClick={onClose}>Close</button>
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

function ConfirmationModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box confirm">
        <h2>📝 Confirm Submission</h2>
        <p>Are you sure you want to submit this process record?</p>
        <button onClick={onConfirm}>Yes, Submit</button>
        <button onClick={onCancel} style={{ backgroundColor: 'gray', color: 'white' }}>Cancel</button>
      </div>
    </div>
  );
}

function ProcessRecordForm({ onSubmitSuccess, recordToEdit, onCancel }) {
  const [form, setForm] = useState({
    productName: '', quantity: '', processMethod: '', dissolvedOxygen: '', temperature: '', pHLevel: '', ammonia: '', metals: '', bacteria: ''
  });
  const [productID, setProductID] = useState('');
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);
  const [algoBalance, setAlgoBalance] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    if (recordToEdit) {
      setForm({
        productName: recordToEdit.product_name,
        quantity: recordToEdit.quantity,
        processMethod: recordToEdit.process_method,
        dissolvedOxygen: recordToEdit.dissolved_oxygen,
        temperature: recordToEdit.temperature,
        pHLevel: recordToEdit.ph_level,
        ammonia: recordToEdit.ammonia,
        metals: recordToEdit.metals,
        bacteria: recordToEdit.bacteria
      });
      setProductID(recordToEdit.product_id);
    }
  }, [recordToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const generateProductID = () => `PID${Date.now()}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmModalVisible(true);
  };

  const proceedSubmit = async () => {
    setConfirmModalVisible(false);
    setIsSubmitting(true);
    const mnemonic = localStorage.getItem('mnemonic');
    const walletAddress = localStorage.getItem('wallet_address');

    if (!mnemonic || mnemonic.split(' ').length !== 25) {
      setErrorModal({ title: '❌ Mnemonic Error', message: 'Mnemonic is missing or invalid. Please log in again.' });
      setIsSubmitting(false);
      return;
    }

    const id = recordToEdit ? recordToEdit.product_id : generateProductID();
    setProductID(id);

    try {
      const blockchainResponse = await fetch(`${import.meta.env.VITE_FASTAPI_API}/api/verify-freshness`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mnemonic,
          product_id: id,
          dissolved_oxygen: parseInt(form.dissolvedOxygen),
          temperature: parseInt(form.temperature) < 0 ? parseInt(form.temperature) + 20 : parseInt(form.temperature),
          pH_level: parseInt(form.pHLevel),
          ammonia: parseInt(form.ammonia),
          metals: parseInt(form.metals),
          bacteria: parseInt(form.bacteria)
        }),
      });

      const blockchainData = await blockchainResponse.json();
      setResult(blockchainData);

      if (blockchainData.status === 'success') {
        const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/process-records${recordToEdit ? `/${id}` : ''}`, {
          method: recordToEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: id,
            product_name: form.productName,
            source: localStorage.getItem('username'),
            quantity: parseInt(form.quantity),
            process_method: form.processMethod,
            dissolved_oxygen: parseInt(form.dissolvedOxygen),
            temperature: parseInt(form.temperature),
            ph_level: parseInt(form.pHLevel),
            ammonia: parseInt(form.ammonia),
            metals: parseInt(form.metals),
            bacteria: parseInt(form.bacteria),
            freshness_score: blockchainData.freshness_score,
            freshness_label: blockchainData.freshness_label,
            company_id: localStorage.getItem('user_id'),
            blockchain_tx_id: blockchainData.tx_id
          })
        });

        if (response.ok) {
          try {
            const balResponse = await fetch(`${import.meta.env.VITE_NODE_API}/api/balance?address=${walletAddress}`);
            const balData = await balResponse.json();
            if (balData.status === 'success') {
              const algo = (parseInt(balData.balance) / 1_000_000).toFixed(3);
              setAlgoBalance(algo);
              setBalanceModalVisible(true);
            } else {
              setErrorModal({ title: '✅ Record Saved', message: "But we couldn't fetch your balance." });
            }
          } catch {
            setErrorModal({ title: '✅ Record Saved', message: 'But failed to retrieve balance data.' });
          }
        } else {
          setErrorModal({ title: '❌ Save Failed', message: 'Database save failed. Please try again.' });
        }
      } else {
        setErrorModal({ title: '❌ Blockchain Verification Failed', message: 'Unable to verify freshness on the blockchain.' });
      }
    } catch (error) {
      console.error(error);
      setErrorModal({ title: '❌ Network Error', message: 'A network error occurred. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-grid">
        <label>Product Name</label>
        <input type="text" name="productName" value={form.productName} onChange={handleChange} required />

        <label>Quantity: {form.quantity} kg</label>
        <input type="range" name="quantity" min="1" max="100" step="1" value={form.quantity} onChange={handleChange} required />

        <label>Process Method</label>
        <select name="processMethod" value={form.processMethod} onChange={handleChange} required>
          <option value="">-- Select --</option>
          <option value="Freezing">Freezing</option>
          <option value="Boiling / Blanching">Boiling / Blanching</option>
          <option value="Drying">Drying</option>
          <option value="Canning">Canning</option>
          <option value="Smoking">Smoking</option>
          <option value="Filleting">Filleting</option>
          <option value="Vacuum Packaging">Vacuum Packaging</option>
        </select>

        <label>Dissolved Oxygen: {form.dissolvedOxygen}</label>
        <input type="range" name="dissolvedOxygen" min="0" max="20" step="1" value={form.dissolvedOxygen} onChange={handleChange} required />
        <label>Temperature: {form.temperature} °C</label>
        <input type="range" name="temperature" min="-20" max="30" step="1" value={form.temperature} onChange={handleChange} required />
        <label>pH Level: {form.pHLevel}</label>
        <input type="range" name="pHLevel" min="5" max="10" step="0.1" value={form.pHLevel} onChange={handleChange} required />
        <label>Ammonia: {form.ammonia}</label>
        <input type="range" name="ammonia" min="0" max="10" step="0.1" value={form.ammonia} onChange={handleChange} required />
        <label>Metals: {form.metals}</label>
        <input type="range" name="metals" min="0" max="10" step="0.1" value={form.metals} onChange={handleChange} required />
        <label>Bacteria: {form.bacteria}</label>
        <input type="range" name="bacteria" min="0" max="100" step="1" value={form.bacteria} onChange={handleChange} required />

        <label>Generated Product ID</label>
        <input type="text" value={productID || (recordToEdit && recordToEdit.product_id) || ''} readOnly />

        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : (recordToEdit ? 'Update Record' : 'Submit Process Record')}</button>
        {recordToEdit && (
          <button type="button" onClick={onCancel} style={{ backgroundColor: 'gray', color: 'white' }} disabled={isSubmitting}>Cancel Edit</button>
        )}
      </form>

      {confirmModalVisible && <ConfirmationModal onConfirm={proceedSubmit} onCancel={() => setConfirmModalVisible(false)} />}
      {errorModal && <ErrorModal title={errorModal.title} message={errorModal.message} onClose={() => setErrorModal(null)} />}
      {balanceModalVisible && (
        <BalanceModal balance={algoBalance} onClose={() => { setBalanceModalVisible(false); onSubmitSuccess(); onCancel(); }} />
      )}
    </div>
  );
}

export default ProcessRecordForm;