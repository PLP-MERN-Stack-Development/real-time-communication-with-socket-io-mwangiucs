import { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    onLogin(username.trim());
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome to Real-Time Chat</h2>
        <p>Enter your username to join the chat</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="login-input"
            autoFocus
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">
            Join Chat
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
