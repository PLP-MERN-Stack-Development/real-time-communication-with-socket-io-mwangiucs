const RoomList = ({ rooms = [], activeRoom, onCreateRoom, onJoinRoom, unreadByRoom = {} }) => {
  let roomName = '';

  const handleCreate = (e) => {
    e.preventDefault();
    const input = e.target.elements.roomName;
    const name = (input.value || '').trim();
    if (name) {
      onCreateRoom(name);
      input.value = '';
    }
  };

  return (
    <div className="room-list">
      <h3>Rooms</h3>
      <ul>
        {rooms.map((r) => (
          <li key={r} className={r === activeRoom ? 'active' : ''}>
            <button onClick={() => onJoinRoom(r)}>
              {r}
              {unreadByRoom[r] > 0 && (
                <span className="badge" style={{ marginLeft: 8 }}>
                  {unreadByRoom[r]}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleCreate} className="create-room-form">
        <input name="roomName" placeholder="New room name" />
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default RoomList;
