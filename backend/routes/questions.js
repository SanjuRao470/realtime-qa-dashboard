import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Question from '../models/Question.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Submit a question (guest or authenticated)
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Question message is required' });
    }

    // For guest users, create a temporary user reference
    // In a real app, you might want to create anonymous user records
    let userId = null;
    
    // Try to extract user from token if present
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        // Invalid token, treat as guest
      }
    }

    // For guest users, generate a valid ObjectId
    // In production, consider creating anonymous user records
    if (!userId) {
      userId = new mongoose.Types.ObjectId();
    }

    const question = new Question({
      userId,
      message: message.trim(),
      status: 'pending'
    });

    await question.save();
    
    // Try to populate user info
    try {
      await question.populate('userId', 'username email');
      // If population returns null/empty, it's a guest
      if (!question.userId || !question.userId.username) {
        question.userId = { _id: userId, username: 'Guest', email: null };
      }
    } catch (error) {
      // Guest user, set default
      question.userId = { _id: userId, username: 'Guest', email: null };
    }

    // Emit socket event for new question
    const io = req.app.get('io');
    if (io) {
      io.emit('questionReceived', question);
    }

    res.status(201).json({
      message: 'Question submitted successfully',
      question
    });
  } catch (error) {
    console.error('Submit question error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get all questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('userId', 'username email')
      .populate('answers.userId', 'username email')
      .sort({ createdAt: -1 });

    // Handle guest users (when populate returns null)
    const processedQuestions = questions.map(q => {
      if (!q.userId || !q.userId.username) {
        q.userId = { _id: q.userId?._id || q.userId, username: 'Guest', email: null };
      }
      // Handle guest users in answers
      if (q.answers && q.answers.length > 0) {
        q.answers = q.answers.map(a => {
          if (!a.userId || !a.userId.username) {
            a.userId = { _id: a.userId?._id || a.userId, username: 'Admin', email: null };
          }
          return a;
        });
      }
      return q;
    });

    // Sort: escalated first, then by newest
    const sortedQuestions = processedQuestions.sort((a, b) => {
      if (a.status === 'escalated' && b.status !== 'escalated') return -1;
      if (a.status !== 'escalated' && b.status === 'escalated') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({ questions: sortedQuestions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update question status (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'escalated', 'answered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('userId', 'username email')
      .populate('answers.userId', 'username email');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Handle guest users
    if (!question.userId || !question.userId.username) {
      question.userId = { _id: question.userId?._id || question.userId, username: 'Guest', email: null };
    }

    // Emit socket event for status update
    const io = req.app.get('io');
    if (io) {
      io.emit('questionStatusChanged', question);
    }

    res.json({
      message: 'Question status updated successfully',
      question
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Submit an answer (admin only)
router.post('/:id/answers', authenticate, requireAdmin, async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: 'Answer is required' });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.answers.push({
      userId: req.user.id,
      answer: answer.trim()
    });

    // Auto-update status to 'answered' when answer is added
    question.status = 'answered';

    await question.save();
    await question.populate('userId', 'username email');
    await question.populate('answers.userId', 'username email');

    // Handle guest users
    if (!question.userId || !question.userId.username) {
      question.userId = { _id: question.userId?._id || question.userId, username: 'Guest', email: null };
    }

    // Emit socket event for new answer
    const io = req.app.get('io');
    if (io) {
      io.emit('answerReceived', question);
    }

    res.status(201).json({
      message: 'Answer submitted successfully',
      question
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;

