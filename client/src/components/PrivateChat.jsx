import { useState, useEffect, useRef } from 'react';

const PrivateChat = ({
  recipientId,
  recipientName,
  currentUser,
  messages = [],
  onSendMessage,
  onClose,
  onTyping
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(recipientId, message);
      setMessage('');
      onTyping(false);
    }
  };

  const handleTyping = (typing) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      onTyping(typing);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, []);

  return (
    <div className="private-chat">
      <div className="private-chat-header">
        <h4>Chat with {recipientName}</h4>
        <button onClick={onClose} className="close-chat-btn">
          ×
        </button>
      </div>
      
      <div className="private-messages">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`private-message ${msg.sender === currentUser ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              <p>{msg.message || msg.text}</p>
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSend} className="private-message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (!isTyping) handleTyping(true);
            
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
            typingTimeout.current = setTimeout(() => {
              handleTyping(false);
            }, 2000);
          }}
          placeholder={`Message ${recipientName}...`}
          className="private-message-input"
        />
        <button type="submit" className="send-private-message">
          Send
        </button>
      </form>
    </div>
  );
};

export default PrivateChat;
