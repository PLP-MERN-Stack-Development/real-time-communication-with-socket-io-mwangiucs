# Real-Time Chat Application with Socket.io

This assignment focuses on building a real-time chat application using Socket.io, implementing bidirectional communication between clients and server.

## Assignment Overview

You will build a chat application with the following features:
1. Real-time messaging using Socket.io
2. User authentication and presence
3. Multiple chat rooms or private messaging
4. Real-time notifications
5. Advanced features like typing indicators and read receipts

## Features Implemented (Week 5 Mapping)

- Task 1 — Setup
  - Express server with Socket.io, CORS, dotenv
  - React + Vite client with socket.io-client
  - Client–server connection via `VITE_SOCKET_URL` or proxy

- Task 2 — Core Chat
  - Username login (simple auth)
  - Global room (default `general`)
  - Messages with sender + timestamp
  - Typing indicators
  - Online/offline presence and user list

- Task 3 — Advanced Features
  - Private messaging (UI + server + typing for PM)
  - Multiple rooms/channels (create/join, room history)
  - Image/file sharing (base64; inline images, download for others)

- Task 4 — Notifications
  - System join/leave messages
  - Unread counts per room (badges)
  - Desktop notifications when unfocused
  - Sound ping on new message when unfocused

## How to Run Locally

Prereqs: Node.js v18+

1) Install dependencies
```
cd server && npm install
cd ../client && npm install
```

2) Environment (optional)
```
# server/.env
PORT=5000

# client/.env
VITE_SOCKET_URL=http://localhost:5000
```

3) Start dev servers (two terminals)
```
# Terminal A
cd server
npm run dev

# Terminal B
cd client
npm run dev
```

4) Open the app
- Client: http://localhost:5173
- Server health: http://localhost:5000

## Usage Tips

- Open two browser windows, log in with different usernames
- Use Rooms sidebar to create/join channels
- Click 💬 next to a user to open a private chat window
- Paperclip in the message box to share an image/file
- Allow browser notifications to receive desktop alerts

## Screenshots / GIFs

- Global chat in room `general`: ./docs/screenshots/global-chat.jpg
- Private chat window: ./docs/screenshots/private-chat.jpg
- Rooms and unread badges: ./docs/screenshots/rooms-unread.jpg
- File sharing (inline image): ./docs/screenshots/file-sharing.jpg

## Project Structure

```
socketio-chat/
├── client/                 # React front-end
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # UI components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── socket/         # Socket.io client setup
│   │   └── App.jsx         # Main application component
│   └── package.json        # Client dependencies
├── server/                 # Node.js back-end
│   ├── config/             # Configuration files
│   ├── controllers/        # Socket event handlers
│   ├── models/             # Data models
│   ├── socket/             # Socket.io server setup
│   ├── utils/              # Utility functions
│   ├── server.js           # Main server file
│   └── package.json        # Server dependencies
└── README.md               # Project documentation
```

## Getting Started

1. Accept the GitHub Classroom assignment invitation
2. Clone your personal repository that was created by GitHub Classroom
3. Follow the setup instructions in the `Week5-Assignment.md` file
4. Complete the tasks outlined in the assignment

## Files Included

- `Week5-Assignment.md`: Detailed assignment instructions
- Starter code for both client and server:
  - Basic project structure
  - Socket.io configuration templates
  - Sample components for the chat interface

## Requirements

- Node.js (v18 or higher)
- npm or yarn
- Modern web browser
- Basic understanding of React and Express

## Submission

Your work will be automatically submitted when you push to your GitHub Classroom repository. Make sure to:

1. Complete both the client and server portions of the application
2. Implement the core chat functionality
3. Add at least 3 advanced features
4. Document your setup process and features in the README.md
5. Include screenshots or GIFs of your working application
6. Optional: Deploy your application and add the URLs to your README.md

## Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Building a Chat Application with Socket.io](https://socket.io/get-started/chat) 