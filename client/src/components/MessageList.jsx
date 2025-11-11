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
              {message.text && <p>{message.text}</p>}
              {message.attachment && (
                message.attachment.mime?.startsWith('image/') ? (
                  <img 
                    src={message.attachment.data} 
                    alt={message.attachment.filename || 'image'} 
                    style={{ maxWidth: '220px', borderRadius: '6px', marginTop: '6px' }}
                  />
                ) : (
                  <a 
                    href={message.attachment.data} 
                    download={message.attachment.filename || 'file'}
                    className="file-download-link"
                  >
                    {message.attachment.filename || 'Download file'}
                  </a>
                )
              )}
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
