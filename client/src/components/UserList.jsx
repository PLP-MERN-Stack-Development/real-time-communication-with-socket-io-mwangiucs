const UserList = ({ users, currentUser }) => {
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
            {user.username === currentUser && ' (You)'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
