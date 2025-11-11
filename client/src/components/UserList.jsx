const UserList = ({ users, currentUser, onStartPrivateChat }) => {
  return (
    <div className="user-list">
      <h3>Online Users ({users.length})</h3>
      <ul>
        {users.map((user) => (
          <li 
            key={user.id} 
            className={user.username === currentUser ? 'current-user' : ''}
          >
            <span className="user-status-dot"></span>
            {user.username}
            {user.username === currentUser ? ' (You)' : (
              <button 
                onClick={() => onStartPrivateChat && onStartPrivateChat(user.id, user.username)}
                className="private-message-btn"
                title={`Message ${user.username}`}
              >
                💬
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
