export const socketHandler = (socket, io) => {
  console.log('✅ Client connected:', socket.id);

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });

  // Note: Real-time events are emitted from route handlers after database operations
  // This ensures data consistency and proper error handling
};
