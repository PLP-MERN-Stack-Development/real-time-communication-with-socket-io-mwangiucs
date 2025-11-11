import { useState, useEffect, useRef } from 'react';

const MessageInput = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);

  // Handle typing indicator with debounce
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    } else if (!message.trim() && isTyping) {
      setIsTyping(false);
      onTyping(false);
    }

    // Clear any existing timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Set a new timeout to handle when user stops typing
    if (isTyping) {
      typingTimeout.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 2000);
    }

    // Cleanup function to clear timeout on unmount
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [message, isTyping, onTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      
      // Notify that user has stopped typing
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-input-container">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="message-input"
      />
      <button 
        type="submit" 
        className="send-button"
        disabled={!message.trim()}
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;
