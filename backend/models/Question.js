import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const questionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Question message is required'],
    trim: true,
    minlength: [1, 'Question cannot be empty']
  },
  status: {
    type: String,
    enum: ['pending', 'escalated', 'answered'],
    default: 'pending'
  },
  answers: [answerSchema]
}, {
  timestamps: true
});

// Index for efficient queries
questionSchema.index({ status: 1, createdAt: -1 });

const Question = mongoose.model('Question', questionSchema);

export default Question;

