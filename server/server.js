// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and messages
const users = {};
const rooms = new Set(['general']);
const messagesByRoom = { general: [] };
const typingUsers = {}; // keyed by socket.id -> username (current room-scoped upon emit)

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id };
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    // auto-join default room
    const defaultRoom = 'general';
    socket.join(defaultRoom);
    socket.data.room = defaultRoom;
    // send rooms and current room history
    io.emit('rooms', Array.from(rooms));
    socket.emit('room_joined', { room: defaultRoom });
    socket.emit('room_history', { room: defaultRoom, messages: messagesByRoom[defaultRoom] || [] });
    console.log(`${username} joined the chat`);
  });

  // Handle chat messages (scoped to current room)
  socket.on('send_message', (messageData) => {
    const room = socket.data.room || 'general';
    const message = {
      ...messageData,
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
      room,
    };
    // store per room
    if (!messagesByRoom[room]) messagesByRoom[room] = [];
    messagesByRoom[room].push(message);
    // Limit stored messages per room
    if (messagesByRoom[room].length > 200) {
      messagesByRoom[room].shift();
    }
    // emit only to room
    io.to(room).emit('receive_message', message);
  });

  // Handle typing indicator (scoped to current room)
  socket.on('typing', (isTyping) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      const room = socket.data.room || 'general';
      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }
      // Only emit to current room
      io.to(room).emit('typing_users', Object.values(typingUsers));
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      to,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };
    
    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
  });

  // Handle private typing indicator
  socket.on('private_typing', ({ to, isTyping }) => {
    // Notify only the intended recipient
    socket.to(to).emit('user_typing_private', { userId: socket.id, isTyping });
  });

  // Rooms: create and join
  socket.on('room_create', (name) => {
    const room = String(name || '').trim();
    if (!room) return;
    rooms.add(room);
    if (!messagesByRoom[room]) messagesByRoom[room] = [];
    io.emit('rooms', Array.from(rooms));
  });

  socket.on('room_join', (name) => {
    const room = String(name || '').trim();
    if (!room) return;
    if (!rooms.has(room)) {
      rooms.add(room);
      messagesByRoom[room] = [];
      io.emit('rooms', Array.from(rooms));
    }
    // leave previous room
    const prev = socket.data.room;
    if (prev) socket.leave(prev);
    socket.join(room);
    socket.data.room = room;
    socket.emit('room_joined', { room });
    socket.emit('room_history', { room, messages: messagesByRoom[room] || [] });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }
    
    delete users[socket.id];
    delete typingUsers[socket.id];
    
    io.emit('user_list', Object.values(users));
    io.emit('typing_users', Object.values(typingUsers));
  });
});

// API routes
app.get('/api/messages', (req, res) => {
  const room = (req.query.room || 'general');
  res.json(messagesByRoom[room] || []);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 