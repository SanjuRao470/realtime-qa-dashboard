
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
app.set('trust proxy', 1); // important for Render / proxies

/* ================================
   CORS CONFIG (FIXED)
================================ */

const allowedOrigins = [
  'http://localhost:3000',
  'https://realtime-qa-dashboard.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow Postman / server-to-server requests
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};


/* ================================
   SERVER + SOCKET.IO
================================ */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});


/* ================================
   MIDDLEWARE
================================ */
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 



// Attach io to app (for routes)
app.set('io', io);

/* ================================
   ROUTES
================================ */
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

/* ================================
   SOCKET.IO HANDLER
================================ */
io.on('connection', (socket) => {
  socketHandler(socket, io);
});

/* ================================
   DATABASE + SERVER START
================================ */
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);

    if (
      error.code === 8000 ||
      error.message.includes('authentication failed')
    ) {
      console.error('\n💡 MongoDB Atlas Authentication Tips:');
      console.error('1. Check MONGODB_URI in Render env');
      console.error('2. Ensure username/password are correct');
      console.error('3. Whitelist IP: 0.0.0.0/0 in MongoDB Atlas');
    }

    process.exit(1);
  });
