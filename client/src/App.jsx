import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { io } from 'socket.io-client';

// Components
import Login from './components/Login';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import UserList from './components/UserList';

// Styles
import './App.css';

// Initialize socket connection
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  extraHeaders: {
    'my-custom-header': 'abcd'
  }
});

function App() {
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Handle user login
  const handleLogin = (username) => {
    if (username.trim()) {
      setUsername(username);
      socket.auth = { username };
      socket.connect();
    }
  };

  // Handle sending a new message
  const handleSendMessage = (text) => {
    if (text.trim()) {
      socket.emit('send_message', {
        text,
        sender: username,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Handle typing indicator
  const handleTyping = (isTyping) => {
    socket.emit('typing', isTyping);
  };

  // Set up socket event listeners
  useEffect(() => {
    // Connection established
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // Join the chat with username
      socket.emit('user_join', username);
    });

    // Handle received messages
    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Handle user list updates
    socket.on('user_list', (userList) => {
      setUsers(userList);
    });

    // Handle typing indicators
    socket.on('typing_users', (typingUsersList) => {
      setTypingUsers(typingUsersList);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Clean up event listeners
    return () => {
      socket.off('connect');
      socket.off('receive_message');
      socket.off('user_list');
      socket.off('typing_users');
      socket.off('disconnect');
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [username]);

  // Render login screen if not logged in
  if (!username) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Real-Time Chat</h1>
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </header>
      
      <div className="chat-container">
        <UserList users={users} currentUser={username} />
        
        <div className="chat-main">
          <MessageList 
            messages={messages} 
            currentUser={username} 
            typingUsers={typingUsers}
          />
          <MessageInput 
            onSendMessage={handleSendMessage} 
            onTyping={handleTyping} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;
