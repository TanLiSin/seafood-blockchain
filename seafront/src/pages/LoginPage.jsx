import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [useid, setUseid] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // For non-Customer roles, validate all fields
    if (!role || (role !== 'Customer' && (!username || !useid))) {
      alert('Please fill in all required fields');
      return;
    }

    // Auto-login redirect for Guest/Customer
    if (role === 'Customer') {
      localStorage.setItem('role', 'Customer');
      navigate('/customer-home');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_NODE_API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          useid,
          requiredRole: role
        }),
      });

      const data = await response.json();
      console.log("🟡 Login response from backend:", data);

      if (response.status !== 200 || !data.user) {
        alert(data.error || 'Login failed');
        return;
      }

      const { user } = data;

      localStorage.setItem('user_id', user.id);
      localStorage.setItem('username', user.username);
      localStorage.setItem('role', user.role);

      // ✅ Optional: store wallet address only if present
      if (user.wallet_address) {
        localStorage.setItem('mnemonic', user.mnemonic);
        localStorage.setItem('wallet_address', user.wallet_address);
      } else {
        localStorage.removeItem('wallet_address');
        localStorage.removeItem('mnemonic');
      }

      switch (role) {
        case "Supplier": navigate('/supplier-home'); break;
        case "Distributor": navigate('/distributor-home'); break;
        case "Company": navigate('/company-home'); break;
        case "Regulatory": navigate('/regulatory-home'); break;
        case "Admin": navigate('/admin-home'); break;
        default: alert('Unknown role');
      }

    } catch (error) {
      console.error('❌ Error during login:', error);
      alert('Server error. Please try again later.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="/pictures/logo.png" alt="Logo" className="logo" />
        <h3>SeaBlock</h3>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="role">Select Role:</label>
            <select
              id="role"
              onChange={(e) => setRole(e.target.value)}
              value={role}
              required
            >
              <option value="">-- Select Role --</option>
              <option value="Customer">Customer</option>
              <option value="Supplier">Supplier</option>
              <option value="Company">Company</option>
              <option value="Distributor">Distributor</option>
              <option value="Regulatory">Regulatory</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {role !== "Customer" && (
            <>
              <div className="input-group">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="useid">Password:</label>
                <input
                  type="password"
                  id="useid"
                  placeholder="Enter your user password"
                  value={useid}
                  onChange={(e) => setUseid(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="submit-btn">
            {role === "Customer" ? "Enter as Guest" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
