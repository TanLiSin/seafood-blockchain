import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminHome.css';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    email: '',
    wallet_address: '',
    phone_no: '',
    licenseFile: null,
    existingLicense: '',
    role: '',
    mnemonic: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const generateUserId = (role) => {
    const prefixMap = {
      Supplier: 'S',
      Company: 'C',
      Distributor: 'D',
      Regulatory: 'R'
    };
    const prefix = prefixMap[role] || 'X';
    const existingUsers = users.filter(u => u.id?.startsWith(prefix));
    const idNumber = (existingUsers.length + 1).toString().padStart(3, '0');
    return `${prefix}${idNumber}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, licenseFile: file }));
  };

  const handleSubmit = async () => {
    const { id, username, email, wallet_address, phone_no, role, licenseFile, mnemonic } = formData;

    if (!username || !email || !wallet_address || !phone_no || !role || (mode === 'add' && !mnemonic)) {
      alert('Please fill in all required fields' + (mode === 'add' ? ' including mnemonic.' : '.'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const walletRegex = /^.{58}$/;

    if (!emailRegex.test(email)) {
      alert('Invalid email format.');
      return;
    }
    if (!walletRegex.test(wallet_address)) {
      alert('Invalid wallet address.');
      return;
    }

    const finalId = mode === 'edit' ? id : generateUserId(role);
    const formDataToSend = new FormData();

    formDataToSend.append('id', finalId);
    formDataToSend.append('username', username);
    formDataToSend.append('email', email);
    formDataToSend.append('wallet_address', wallet_address);
    formDataToSend.append('phone_no', phone_no);
    formDataToSend.append('role', role);
    formDataToSend.append('mnemonic', mnemonic);
    if (licenseFile) {
      formDataToSend.append('license', licenseFile);
    }

    try {
      await axios.post(`${import.meta.env.VITE_NODE_API}/api/users`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchUsers();
      setShowModal(false);
      setMode('add');
      setFormData({
        id: '',
        username: '',
        email: '',
        wallet_address: '',
        phone_no: '',
        licenseFile: null,
        existingLicense: '',
        role: '',
        mnemonic: ''
      });
    } catch (error) {
      console.error('Error adding/updating user:', error);
      alert('User creation or update failed.');
    }
  };

  const openEditModal = (user) => {
    setFormData({
      id: user.id,
      username: user.username || '',
      email: user.email || '',
      wallet_address: user.wallet_address || '',
      phone_no: user.phone_no || '',
      licenseFile: null,
      existingLicense: user.license || '',
      role: user.role || '',
      mnemonic: '' // don't preload for security
    });
    setMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/users/${userId}`);
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = filter === 'All' ? users : users.filter(u => u.role === filter);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="admin-container">
      <div className="header-bar">
        <h2>ADMIN</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="filter-tabs">
        {['All', 'Supplier', 'Company', 'Distributor', 'Regulatory'].map(role => (
          <button key={role} onClick={() => setFilter(role)} className={filter === role ? 'active' : ''}>{role}</button>
        ))}
      </div>
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>UserID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Wallet Address</th>
              <th>Phone No</th>
              <th>License</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={index}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email || 'NULL'}</td>
                <td>{user.wallet_address}</td>
                <td>{user.phone_no || 'NULL'}</td>
                <td>
                  {user.license ? (
                    <a href={`${import.meta.env.VITE_API_BASE_URL}/uploads/${user.license}`} target="_blank" rel="noopener noreferrer">
                      <button>Download</button>
                    </a>
                  ) : 'No File'}
                </td>
                <td>{user.role}</td>
                <td><button onClick={() => openEditModal(user)}>Edit</button>
                  <button onClick={() => handleDelete(user.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="add-btn" onClick={() => {
        setShowModal(true);
        setMode('add');
        setFormData({
          id: '',
          username: '',
          email: '',
          wallet_address: '',
          phone_no: '',
          licenseFile: null,
          existingLicense: '',
          role: '',
          mnemonic: ''
        });
      }}>Add</button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{mode === 'edit' ? 'Edit User' : 'Register User'}</h3>

            {['username', 'email', 'wallet_address', 'phone_no'].map(field => (
              <div key={field} className="input-group">
                <label>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:</label>
                <input
                  type="text"
                  name={field}
                  value={formData[field] || ''}
                  onChange={handleInputChange}
                />
              </div>
            ))}

            <div className="input-group">
              <label>Mnemonic (seed phrase):</label>
              <textarea
                name="mnemonic"
                value={formData.mnemonic || ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter 25-word mnemonic seed"
                required={mode === 'add'}
              />
            </div>

            {formData.existingLicense && (
              <div className="input-group">
                <label>Previously Uploaded License:</label>
                <a
                  href={`${import.meta.env.VITE_API_BASE_URL}/uploads/${formData.existingLicense}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View License
                </a>
              </div>
            )}

            <div className="input-group">
              <label>License (PDF only):</label>
              <input type="file" accept="application/pdf" onChange={handleFileChange} />
            </div>

            <div className="input-group">
              <label>Role:</label>
              <select name="role" value={formData.role} onChange={handleInputChange}>
                <option value="">-- Select Role --</option>
                <option value="Supplier">Supplier</option>
                <option value="Company">Company</option>
                <option value="Distributor">Distributor</option>
                <option value="Regulatory">Regulatory</option>
              </select>
            </div>

            <button onClick={handleSubmit}>Save</button>
            <button onClick={() => {
              setShowModal(false);
              setMode('add');
            }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
