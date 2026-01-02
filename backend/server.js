import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import { socketHandler } from './socket/socketHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach io to app for use in routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  socketHandler(socket, io);
});

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/realtime-qa';

// MongoDB connection options
const mongooseOptions = {
  // Remove deprecated options and use modern ones
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Provide helpful error messages
    if (error.code === 8000 || error.message.includes('authentication failed')) {
      console.error('\n💡 MongoDB Atlas Authentication Error Tips:');
      console.error('1. Check your MONGODB_URI in .env file');
      console.error('2. Ensure username and password are correct (URL-encoded if needed)');
      console.error('3. Make sure your IP address is whitelisted in MongoDB Atlas');
      console.error('4. Connection string format should be:');
      console.error('   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
      console.error('\n5. If password contains special characters, URL-encode them:');
      console.error('   @ → %40, # → %23, / → %2F, etc.');
      console.error('\n6. For local MongoDB, use: mongodb://localhost:27017/realtime-qa');
    }
    
    process.exit(1);
  });

