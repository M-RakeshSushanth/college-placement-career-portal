import { io } from 'socket.io-client';

let socket = null;

export const initSocketClient = (user) => {
  if (!socket) {
    socket = io('/', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      // console.log('[Socket] Connected to server:', socket.id);
      if (user) {
        socket.emit('join', {
          userId: user.id || user._id,
          role: user.role,
        });
      }
    });
  } else if (user) {
    socket.emit('join', {
      userId: user.id || user._id,
      role: user.role,
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
