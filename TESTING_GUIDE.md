# Testing Guide - Real-Time Q&A Dashboard

This guide will walk you through testing the application as both Guest and Admin users.

## 📋 Prerequisites

1. **Start MongoDB** (local or ensure MongoDB Atlas is configured)
2. **Start Backend Server**
3. **Start Frontend Server**

## 🚀 Starting the Application

### Step 1: Start Backend Server

```bash
cd backend
npm install  # If not already done
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

### Step 2: Start Frontend Server

Open a new terminal:

```bash
cd frontend
npm install  # If not already done
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

### Step 3: Open Browser

Navigate to: `http://localhost:3000`

---

## 👤 Testing as Guest User

### Guest users can:
- ✅ Submit questions without logging in
- ❌ Cannot view dashboard (requires login)
- ❌ Cannot manage questions

### Test Steps:

1. **Submit a Question as Guest**
   - Go to `http://localhost:3000`
   - You'll see the "Submit Your Question" page
   - Enter a question in the text area, e.g., "What is React?"
   - Click "Submit Question"
   - You should see a success toast notification

2. **Submit Multiple Questions**
   - Submit 2-3 more questions as a guest
   - This will help test the dashboard later

---

## 🔐 Testing as Regular User (Guest Role)

### Regular users can:
- ✅ Submit questions
- ✅ View dashboard
- ❌ Cannot update question status
- ❌ Cannot submit answers

### Test Steps:

1. **Register a New User**
   - Click "Register" in the top navigation
   - Fill in the form:
     - Username: `testuser`
     - Email: `testuser@example.com`
     - Password: `password123` (minimum 6 characters)
     - Confirm Password: `password123`
   - Click "Register"
   - You'll be automatically logged in and redirected to dashboard

2. **View Dashboard as Regular User**
   - You should see all questions (including guest questions)
   - Questions are sorted: Escalated first, then newest first
   - You can see question status badges (Pending, Escalated, Answered)
   - **Note**: You won't see admin controls (status buttons, answer form)

3. **Submit Questions as Authenticated User**
   - Click "Submit Question" in navigation or go to home page
   - Submit a question while logged in
   - Go back to dashboard to see your question

---

## 👑 Testing as Admin User

### Admin users can:
- ✅ All guest/regular user permissions
- ✅ Update question status (Pending, Escalated, Answered)
- ✅ Submit answers to questions
- ✅ View all questions with admin controls

### Step 1: Create an Admin User

**Option A: Using the Script (Recommended)**

```bash
cd backend
npm run create-admin
```

Follow the prompts:
- Enter username: `admin`
- Enter email: `admin@example.com`
- Enter password: `admin123`

**Option B: Update Existing User in MongoDB**

```javascript
// In MongoDB shell or MongoDB Compass
db.users.updateOne(
  { email: "testuser@example.com" },
  { $set: { role: "admin" } }
)
```

### Step 2: Login as Admin

1. **Logout** if you're currently logged in (click "Logout" button)
2. Click "Login" in navigation
3. Enter admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
4. Click "Login"
5. You'll be redirected to the dashboard

### Step 3: Test Admin Features

#### A. Update Question Status

1. In the dashboard, find a question with "Pending" status
2. You should see three buttons:
   - **Set Pending** (yellow)
   - **Escalate** (red)
   - **Mark Answered** (green)
3. Click **"Escalate"** on a question
   - The status badge should change to "Escalated" (red)
   - The question should move to the top (escalated questions are pinned)
   - You should see a success toast
4. Click **"Mark Answered"** on a question
   - Status changes to "Answered" (green)
5. Click **"Set Pending"** to change it back to Pending

#### B. Submit Answers

1. Find a question (any status)
2. Click **"Add Answer"** button
3. A text area will appear below the question
4. Enter an answer, e.g., "React is a JavaScript library for building user interfaces."
5. Click **"Submit Answer"**
6. The answer should appear below the question in a blue box
7. The question status automatically changes to "Answered"
8. You'll see:
   - Answer text
   - "By: admin" (or your username)
   - Timestamp

#### C. Multiple Answers

1. You can add multiple answers to the same question
2. Click "Add Answer" again
3. Submit another answer
4. Both answers should be visible

---

## 🔄 Testing Real-Time Features

Real-time updates work when multiple users/browsers are connected.

### Test Setup:

1. **Open Multiple Browser Windows/Tabs**
   - Window 1: Admin user logged in (Dashboard)
   - Window 2: Guest user (Home page - Submit Question)
   - Window 3: Regular user logged in (Dashboard) - Optional

### Test Scenarios:

#### Scenario 1: New Question Real-Time Update

1. In Window 2 (Guest), submit a new question
2. In Window 1 (Admin Dashboard), the question should appear **automatically** without refreshing
3. You should see a toast notification: "New question received!"

#### Scenario 2: Status Update Real-Time

1. In Window 1 (Admin), escalate a question
2. In Window 3 (Regular User Dashboard), the status should update **automatically**
3. The question should move to the top (if escalated)
4. Toast notification: "Question status updated"

#### Scenario 3: Answer Real-Time Update

1. In Window 1 (Admin), add an answer to a question
2. In Window 3 (Regular User), the answer should appear **automatically**
3. Toast notification: "New answer added!"

---

## 📝 Complete Testing Checklist

### Guest User Testing
- [ ] Can access home page without login
- [ ] Can submit questions without authentication
- [ ] Receives success notification after submission
- [ ] Cannot access dashboard (redirects to login)

### Regular User Testing
- [ ] Can register new account
- [ ] Can login with registered credentials
- [ ] Can view dashboard after login
- [ ] Can see all questions with status badges
- [ ] Cannot see admin controls (status buttons, answer form)
- [ ] Can submit questions while logged in
- [ ] Can logout successfully

### Admin User Testing
- [ ] Can login as admin
- [ ] Can see admin controls on dashboard
- [ ] Can update question status (Pending → Escalated → Answered)
- [ ] Escalated questions appear at top
- [ ] Can submit answers to questions
- [ ] Question status auto-changes to "Answered" when answer added
- [ ] Can add multiple answers to same question
- [ ] Answers display with username and timestamp

### Real-Time Testing
- [ ] New questions appear in real-time on dashboard
- [ ] Status updates reflect in real-time across browsers
- [ ] Answers appear in real-time across browsers
- [ ] Toast notifications appear for real-time events

### UI/UX Testing
- [ ] Responsive design works on mobile/tablet
- [ ] Status badges have correct colors (Yellow/Red/Green)
- [ ] Escalated questions have red border indicator
- [ ] Forms validate input (empty fields, password mismatch)
- [ ] Error messages display correctly
- [ ] Loading states work (buttons show "Submitting...", etc.)

---

## 🐛 Troubleshooting

### Issue: "Cannot access dashboard"
- **Solution**: You must be logged in. Click "Login" or "Register" first.

### Issue: "Admin controls not showing"
- **Solution**: Make sure your user role is set to "admin". Use `npm run create-admin` or update in MongoDB.

### Issue: "Real-time updates not working"
- **Solution**: 
  - Check that backend server is running
  - Check browser console for Socket.io connection errors
  - Ensure both browsers are connected (check backend logs for connection messages)

### Issue: "Questions not appearing"
- **Solution**: 
  - Check MongoDB connection
  - Check browser console for API errors
  - Verify questions were saved (check MongoDB directly)

### Issue: "Status update not working"
- **Solution**: 
  - Ensure you're logged in as admin
  - Check browser console for errors
  - Verify JWT token is valid (logout and login again)

---

## 🎯 Quick Test Script

Here's a quick sequence to test everything:

1. **Guest Mode**: Submit 2 questions from home page (no login)
2. **Register**: Create account `testuser@example.com` / `password123`
3. **View**: Check dashboard - should see all questions, no admin controls
4. **Create Admin**: Run `npm run create-admin` in backend directory
5. **Login Admin**: Logout, then login as admin
6. **Admin Actions**: 
   - Escalate 1 question
   - Add answer to 1 question
   - Change status of 1 question
7. **Real-Time**: Open second browser, login as testuser, watch updates in real-time

---

## 📸 Expected Screenshots Reference

### Guest Home Page
- Navigation: "Login" and "Register" buttons
- Large text area for question input
- "Submit Question" button

### Dashboard (Regular User)
- Navigation: "Welcome, [username]" and "Logout"
- List of all questions with status badges
- No admin control buttons

### Dashboard (Admin)
- Same as regular user, but with:
  - Status buttons (Set Pending, Escalate, Mark Answered)
  - "Add Answer" button on each question
  - Answer submission form (when "Add Answer" clicked)

---

Happy Testing! 🎉


