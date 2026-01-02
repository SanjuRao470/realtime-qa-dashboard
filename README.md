# Real-Time Q&A Dashboard

A full-stack MERN application for real-time question and answer management with WebSocket support, authentication, and role-based access control.

## 🚀 Features

- **Guest Question Submission**: Users can submit questions without logging in
- **User Authentication**: Register and login system with JWT tokens
- **Admin Dashboard**: Authenticated admins can manage question status and submit answers
- **Real-Time Updates**: Live updates using WebSocket (Socket.io)
- **Status Management**: Questions can be marked as Pending, Escalated, or Answered
- **Responsive UI**: Beautiful, modern interface built with Tailwind CSS

## 🏗️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.io** - WebSocket library for real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Vite** - Build tool
- **Axios** - HTTP client
- **Socket.io Client** - WebSocket client
- **Tailwind CSS** - Styling framework

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd realtime-qa-dashboard
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory. See `backend/MONGODB_SETUP.md` for detailed MongoDB connection instructions.

**For Local MongoDB:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/realtime-qa
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**For MongoDB Atlas (Cloud):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/realtime-qa?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**⚠️ Important:** If your MongoDB Atlas password contains special characters (@, #, $, etc.), you must URL-encode them in the connection string. See `backend/MONGODB_SETUP.md` for details.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🚀 Running the Application

### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Questions
- `POST /api/questions` - Submit a question (guest or authenticated)
- `GET /api/questions` - Get all questions
- `PUT /api/questions/:id` - Update question status (admin only)
- `POST /api/questions/:id/answers` - Submit an answer (admin only)

## 🔐 User Roles

### Guest Users
- Can submit questions
- Can view questions on the dashboard (if authenticated)

### Admin Users
- All guest permissions
- Can update question status (Pending, Escalated, Answered)
- Can submit answers to questions
- Access to admin dashboard

**Note**: To create an admin user, you'll need to manually update the user's role in MongoDB or create a script. By default, all registered users have the "guest" role.

## 🎯 Usage

1. **Submit Questions**: Visit the home page to submit questions as a guest or authenticated user
2. **View Dashboard**: Login and navigate to `/dashboard` to view all questions
3. **Manage Questions** (Admin only): Update question status and submit answers
4. **Real-Time Updates**: All changes are reflected immediately across all connected clients

## 📁 Project Structure

```
realtime-qa-dashboard/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Question.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── questions.js
│   ├── middleware/
│   │   └── auth.js
│   ├── socket/
│   │   └── socketHandler.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## 🔄 WebSocket Events

### Client → Server
- `newQuestion` - Notify server of new question
- `questionUpdated` - Notify server of status update
- `newAnswer` - Notify server of new answer

### Server → Client
- `questionReceived` - New question available
- `questionStatusChanged` - Question status updated
- `answerReceived` - New answer added

## 🧪 Testing Guide

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for a complete guide on testing the application as Guest and Admin users, including real-time functionality testing.

## 🛠️ Development

### Creating an Admin User

You can create an admin user using the provided script:

```bash
cd backend
npm run create-admin
```

This will prompt you for username, email, and password, and create or update a user with admin role.

Alternatively, you can update the database directly:

```javascript
// In MongoDB shell or using Mongoose
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 🐛 Troubleshooting

- **MongoDB Connection Error**: Ensure MongoDB is running and the connection string in `.env` is correct
- **Port Already in Use**: Change the PORT in `.env` or kill the process using the port
- **CORS Errors**: Check that CLIENT_URL in backend `.env` matches your frontend URL
- **Socket Connection Failed**: Ensure both backend and frontend are running and URLs are correct

## 📝 License

ISC

## 👤 Author

Your Name

---

Made with ❤️ using MERN Stack

