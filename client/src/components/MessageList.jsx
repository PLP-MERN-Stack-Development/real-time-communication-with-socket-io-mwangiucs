import { format } from 'date-fns';

const MessageList = ({ messages, currentUser, typingUsers }) => {
  // Format message timestamp
  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="message-list">
      <div className="messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.sender === currentUser ? 'sent' : 'received'}`}
          >
            {message.sender !== currentUser && (
              <div className="message-sender">{message.sender}</div>
            )}
            <div className="message-content">
              <p>{message.text}</p>
              <span className="message-time">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.length === 1 
            ? `${typingUsers[0]} is typing...`
            : `${typingUsers.join(', ')} are typing...`
          }
        </div>
      )}
    </div>
  );
};

export default MessageList;
