let ioInstance = null;
const userSockets = new Map(); // userId -> Set of socketIds

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on('join', (data) => {
      const { userId, role } = data || {};
      if (userId) {
        socket.userId = userId;
        if (!userSockets.has(userId)) {
          userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);
        socket.join(`user:${userId}`);
      }
      if (role) {
        socket.role = role;
        socket.join(`role:${role}`);
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId && userSockets.has(socket.userId)) {
        const set = userSockets.get(socket.userId);
        set.delete(socket.id);
        if (set.size === 0) {
          userSockets.delete(socket.userId);
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return ioInstance;
};

const emitToUser = (userId, event, payload) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit(event, payload);
  }
};

const emitToRole = (role, event, payload) => {
  if (ioInstance) {
    ioInstance.to(`role:${role}`).emit(event, payload);
  }
};

const broadcastEvent = (event, payload) => {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToRole,
  broadcastEvent
};
