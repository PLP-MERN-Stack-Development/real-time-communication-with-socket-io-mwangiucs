import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { io } from 'socket.io-client';

// Components
import Login from './components/Login';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import UserList from './components/UserList';
import PrivateChat from './components/PrivateChat';
import RoomList from './components/RoomList';

// Styles
import './App.css';
import './components/PrivateChat.css';

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
  const [privateChats, setPrivateChats] = useState({});
  const [activePrivateChats, setActivePrivateChats] = useState({});
  const [rooms, setRooms] = useState(['general']);
  const [activeRoom, setActiveRoom] = useState('general');
  const [unreadByRoom, setUnreadByRoom] = useState({});
  const [isWindowFocused, setIsWindowFocused] = useState(true);

  // Handle user login
  const handleLogin = (username) => {
    if (username.trim()) {
      setUsername(username);
      socket.auth = { username };
      socket.connect();
      // Ask for desktop notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  };

  // Handle sending a new message (supports attachments)
  const handleSendMessage = (input) => {
    const isString = typeof input === 'string';
    const text = isString ? input : (input?.text || '');
    const attachment = isString ? undefined : input?.attachment;
    if (!text.trim() && !attachment) return;

    socket.emit('send_message', {
      text,
      attachment,
      sender: username,
      timestamp: new Date().toISOString()
    });
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
      // Unread count for current room when window not focused
      if (!isWindowFocused) {
        setUnreadByRoom((prev) => ({ ...prev, [message.room || activeRoom]: (prev[message.room || activeRoom] || 0) + 1 }));
      }
      // Desktop + sound if not focused
      if (!isWindowFocused) {
        const preview = message.text || (message.attachment?.filename || 'New message');
        tryNotify(`${message.sender} in ${message.room || 'chat'}`, preview);
        playPing();
      }
    });

    // Handle user list updates
    socket.on('user_list', (userList) => {
      setUsers(userList);
    });

    // Join/leave system messages
    socket.on('user_joined', ({ username: name }) => {
      const sys = { id: Date.now(), sender: 'System', text: `${name} joined`, timestamp: new Date().toISOString(), room: activeRoom };
      setMessages((prev) => [...prev, sys]);
    });
    socket.on('user_left', ({ username: name }) => {
      const sys = { id: Date.now(), sender: 'System', text: `${name} left`, timestamp: new Date().toISOString(), room: activeRoom };
      setMessages((prev) => [...prev, sys]);
    });

    // Handle typing indicators
    socket.on('typing_users', (typingUsersList) => {
      setTypingUsers(typingUsersList);
    });

    // Handle private messages
    socket.on('private_message', (message) => {
      setPrivateChats((prev) => {
        const chatId = message.senderId === socket.id ? message.to || message.recipientId : message.senderId;
        const list = prev[chatId] || [];
        return { ...prev, [chatId]: [...list, message] };
      });
      // Notify on private message from others
      if (message.senderId !== socket.id) {
        // Ensure a chat window is open for the sender on receiver side
        setActivePrivateChats((prev) => ({
          ...prev,
          [message.senderId]: {
            username: message.sender,
            isOpen: true,
            isTyping: (prev[message.senderId]?.isTyping) || false
          }
        }));
        tryNotify(`Message from ${message.sender}`, message.message || message.text || 'New private message');
        playPing();
      }
    });

    // Private typing indicator
    socket.on('user_typing_private', ({ userId, isTyping }) => {
      setActivePrivateChats((prev) => ({
        ...prev,
        [userId]: { ...(prev[userId] || {}), isTyping }
      }));
    });

    // Rooms list update
    socket.on('rooms', (list) => {
      setRooms(Array.isArray(list) ? list : []);
    });

    // On joined a room
    socket.on('room_joined', ({ room }) => {
      setActiveRoom(room);
      // Clear current room messages until history arrives
      setMessages([]);
      // reset unread for this room
      setUnreadByRoom((prev) => ({ ...prev, [room]: 0 }));
    });

    // Room history
    socket.on('room_history', ({ room, messages: history }) => {
      setActiveRoom(room);
      setMessages(Array.isArray(history) ? history : []);
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
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('typing_users');
      socket.off('private_message');
      socket.off('user_typing_private');
      socket.off('rooms');
      socket.off('room_joined');
      socket.off('room_history');
      socket.off('disconnect');
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [username]);

  // Window focus tracking for notifications
  useEffect(() => {
    const onFocus = () => {
      setIsWindowFocused(true);
      // reset unread for current room
      setUnreadByRoom((prev) => ({ ...prev, [activeRoom]: 0 }));
    };
    const onBlur = () => setIsWindowFocused(false);
    const onVis = () => setIsWindowFocused(!document.hidden);
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [activeRoom]);

  // Helpers: desktop notification and ping
  const tryNotify = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted' && !isWindowFocused) {
      try { new Notification(title, { body }); } catch (_) {}
    }
  };
  const playPing = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine'; o.frequency.value = 880; // A5
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      o.start(); o.stop(ctx.currentTime + 0.16);
    } catch (_) {}
  };

  // Private chat handlers
  const handleStartPrivateChat = (userId, name) => {
    setActivePrivateChats((prev) => ({
      ...prev,
      [userId]: { username: name, isOpen: true, isTyping: false }
    }));
  };

  const handleSendPrivateMessage = (recipientId, message) => {
    if (message.trim()) {
      const payload = { to: recipientId, message, timestamp: new Date().toISOString() };
      socket.emit('private_message', payload);
    }
  };

  const handleClosePrivateChat = (userId) => {
    setActivePrivateChats((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  const handleTypingPrivate = (userId, isTyping) => {
    socket.emit('private_typing', { to: userId, isTyping });
  };

  // Rooms handlers
  const handleCreateRoom = (name) => {
    socket.emit('room_create', name);
  };

  const handleJoinRoom = (name) => {
    socket.emit('room_join', name);
  };

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
        <div className="sidebar">
          <RoomList 
            rooms={rooms}
            activeRoom={activeRoom}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            unreadByRoom={unreadByRoom}
          />
          <UserList users={users} currentUser={username} onStartPrivateChat={handleStartPrivateChat} />
        </div>
        
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

      {Object.entries(activePrivateChats).map(([userId, meta]) => (
        meta.isOpen && (
          <PrivateChat
            key={userId}
            recipientId={userId}
            recipientName={meta.username}
            currentUser={username}
            messages={privateChats[userId] || []}
            onSendMessage={handleSendPrivateMessage}
            onClose={() => handleClosePrivateChat(userId)}
            onTyping={(isTyping) => handleTypingPrivate(userId, isTyping)}
          />
        )
      ))}
    </div>
  );
}

export default App;
