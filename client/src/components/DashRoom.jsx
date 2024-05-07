import React, { useEffect, useState } from 'react';

export default function DashRoom() {
  const [rooms, setRooms] = useState([]);
  const [roomNumber, setRoomNumber] = useState('');
  const [description, setDescription] = useState('');
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      console.log(data);
      if (Array.isArray(data)) {
        setRooms(data);
      } else {
        setRooms([]);
        console.error('Error: Response data is not an array');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const createRoom = async () => {
    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomNumber, description }),
      });

      if (response.ok) {
        setRoomNumber('');
        setDescription('');
        fetchRooms();
      } else {
        console.error('Error creating room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const updateRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/update/${editingRoom._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomNumber, description }),
      });

      if (response.ok) {
        setRoomNumber('');
        setDescription('');
        setEditingRoom(null);
        fetchRooms();
      } else {
        console.error('Error updating room');
      }
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      const response = await fetch(`/api/rooms/delete/${roomId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRooms();
      } else {
        console.error('Error deleting room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  const startEditing = (room) => {
    setRoomNumber(room.roomNumber);
    setDescription(room.description);
    setEditingRoom(room);
  };

  const cancelEditing = () => {
    setRoomNumber('');
    setDescription('');
    setEditingRoom(null);
  };

  return (
    <div>
      <h2>Room Management</h2>
      <div>
        <input
          type="text"
          placeholder="Room Number"
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {editingRoom ? (
          <>
            <button onClick={updateRoom}>Update Room</button>
            <button onClick={cancelEditing}>Cancel</button>
          </>
        ) : (
          <button onClick={createRoom}>Create Room</button>
        )}
      </div>
      <ul>
        {rooms.map((room) => (
          <li key={room._id}>
            <div>
              <strong>Room Number:</strong> {room.roomNumber}
            </div>
            <div>
              <strong>Description:</strong> {room.description}
            </div>
            <button onClick={() => startEditing(room)}>Edit</button>
            <button onClick={() => deleteRoom(room._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}