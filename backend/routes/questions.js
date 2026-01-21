
import express from 'express';
import jwt from 'jsonwebtoken';
import Question from '../models/Question.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/* ----------------------------------
   OPTIONAL AUTH MIDDLEWARE (INLINE)
----------------------------------- */
const authenticateOptional = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ normalize user object
      req.user = {
        id: decoded.id || decoded.userId,
        role: decoded.role
      };
    } catch {
      req.user = null;
    }
  }
  next();
};

/* ----------------------------------
   SUBMIT QUESTION (GUEST / AUTH)
----------------------------------- */
router.post('/', authenticateOptional, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Question message is required' });
    }

    const question = new Question({
      message: message.trim(),
      userId: req.user?.id || null, // ✅ FIXED
      status: 'pending'
    });

    await question.save();
    await question.populate('userId', 'username email');

    const io = req.app.get('io');
    if (io) io.emit('questionReceived', question);

    res.status(201).json({
      message: 'Question submitted successfully',
      question
    });
  } catch (error) {
    console.error('Submit question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ----------------------------------
   GET ALL QUESTIONS
----------------------------------- */
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('userId', 'username email')
      .populate('answers.userId', 'username email')
      .sort({ createdAt: -1 });

    const formatted = questions.map(q => {
      if (!q.userId) q.userId = { username: 'Guest' };

      q.answers = q.answers.map(a => {
        if (!a.userId) a.userId = { username: 'Admin' };
        return a;
      });

      return q;
    });

    res.json({ questions: formatted });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ----------------------------------
   UPDATE QUESTION STATUS (ADMIN)
----------------------------------- */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'escalated', 'answered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('userId', 'username email')
      .populate('answers.userId', 'username email');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (!question.userId) question.userId = { username: 'Guest' };

    const io = req.app.get('io');
    if (io) io.emit('questionStatusChanged', question);

    res.json({ message: 'Status updated', question });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ----------------------------------
   SUBMIT ANSWER (ADMIN)
----------------------------------- */
router.post('/:id/answers', authenticate, requireAdmin, async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer?.trim()) {
      return res.status(400).json({ message: 'Answer is required' });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // ✅ FIXED: use req.user.id
    question.answers.push({
      userId: req.user.id,
      answer: answer.trim()
    });

    question.status = 'answered';
    await question.save();

    await question.populate('userId', 'username email');
    await question.populate('answers.userId', 'username email');

    if (!question.userId) question.userId = { username: 'Guest' };

    const io = req.app.get('io');
    if (io) io.emit('answerReceived', question);

    res.status(201).json({
      message: 'Answer submitted successfully',
      question
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
