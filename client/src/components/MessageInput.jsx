import { useState, useEffect, useRef } from 'react';

const MessageInput = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !attachment) return;

    const payload = attachment
      ? { text: message || '', attachment }
      : message;

    onSendMessage(payload);

    setMessage('');
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Notify that user has stopped typing
    if (isTyping) {
      setIsTyping(false);
      onTyping(false);
    }
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        filename: file.name,
        mime: file.type,
        size: file.size,
        data: reader.result, // data URL base64
      });
    };
    reader.readAsDataURL(file);
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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        type="button"
        className="attach-button"
        onClick={handlePickFile}
        title="Attach file"
      >📎</button>
      {attachment && (
        <span className="attachment-chip" title={attachment.filename}>
          {attachment.filename}
        </span>
      )}
      <button 
        type="submit" 
        className="send-button"
        disabled={!message.trim() && !attachment}
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;
