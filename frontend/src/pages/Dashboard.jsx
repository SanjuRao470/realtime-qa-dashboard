import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import Toast from '../components/Toast';

const Dashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/questions');
      setQuestions(response.data.questions);
    } catch (error) {
      showToast('Failed to fetch questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('questionReceived', (question) => {
      setQuestions((prev) => {
        // Avoid duplicates
        const exists = prev.find((q) => q._id === question._id);
        if (exists) return prev;
        
        // Add new question and sort (escalated first, then by newest)
        const updated = [question, ...prev];
        return updated.sort((a, b) => {
          if (a.status === 'escalated' && b.status !== 'escalated') return -1;
          if (a.status !== 'escalated' && b.status === 'escalated') return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      });
      showToast('New question received!', 'info');
    });

    socket.on('questionStatusChanged', (question) => {
      setQuestions((prev) =>
        prev.map((q) => (q._id === question._id ? question : q)).sort((a, b) => {
          if (a.status === 'escalated' && b.status !== 'escalated') return -1;
          if (a.status !== 'escalated' && b.status === 'escalated') return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
      );
      showToast('Question status updated', 'info');
    });

    socket.on('answerReceived', (question) => {
      setQuestions((prev) =>
        prev.map((q) => (q._id === question._id ? question : q))
      );
      showToast('New answer added!', 'success');
    });

    return () => {
      socket.off('questionReceived');
      socket.off('questionStatusChanged');
      socket.off('answerReceived');
    };
  }, [socket]);

  const handleStatusChange = async (questionId, newStatus) => {
    try {
      const response = await api.put(`/questions/${questionId}`, {
        status: newStatus,
      });

      // Socket event will be handled by the server emission
      // The questionStatusChanged event will update the state
      showToast('Status updated successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) {
      showToast('Please enter an answer', 'error');
      return;
    }

    setSubmittingAnswer(true);
    try {
      const response = await api.post(`/questions/${selectedQuestion._id}/answers`, {
        answer: answerText,
      });

      // Socket event will be handled by the server emission
      // The answerReceived event will update the state
      showToast('Answer submitted successfully', 'success');
      setAnswerText('');
      setSelectedQuestion(null);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit answer', 'error');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'escalated':
        return 'bg-red-100 text-red-800';
      case 'answered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-800">Q&A Dashboard</h1>
            <div className="flex gap-4 items-center">
              <span className="text-gray-700">Welcome, {user?.username}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">All Questions</h2>
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Question
          </a>
        </div>

        {questions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No questions yet. Be the first to ask!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question._id}
                className={`bg-white rounded-xl shadow-lg p-6 ${
                  question.status === 'escalated' ? 'border-l-4 border-red-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(question.status)}`}>
                        {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                      </span>
                      {question.status === 'escalated' && (
                        <span className="text-red-600 font-semibold">🔴 Escalated</span>
                      )}
                    </div>
                    <p className="text-gray-800 text-lg mb-2">{question.message}</p>
                    <div className="text-sm text-gray-500">
                      <span>By: {question.userId?.username || 'Guest'}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(question.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {question.answers && question.answers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-2">Answers:</h4>
                    {question.answers.map((answer, idx) => (
                      <div key={idx} className="bg-blue-50 rounded-lg p-4 mb-2">
                        <p className="text-gray-800">{answer.answer}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          By: {answer.userId?.username || 'Admin'} • {formatDate(answer.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {isAdmin && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <button
                        onClick={() => handleStatusChange(question._id, 'pending')}
                        className={`px-3 py-1 rounded text-sm ${
                          question.status === 'pending'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        } transition-colors`}
                      >
                        Set Pending
                      </button>
                      <button
                        onClick={() => handleStatusChange(question._id, 'escalated')}
                        className={`px-3 py-1 rounded text-sm ${
                          question.status === 'escalated'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition-colors`}
                      >
                        Escalate
                      </button>
                      <button
                        onClick={() => handleStatusChange(question._id, 'answered')}
                        className={`px-3 py-1 rounded text-sm ${
                          question.status === 'answered'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        } transition-colors`}
                      >
                        Mark Answered
                      </button>
                      <button
                        onClick={() => setSelectedQuestion(question)}
                        className="px-3 py-1 rounded text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        Add Answer
                      </button>
                    </div>

                    {selectedQuestion && selectedQuestion._id === question._id && (
                      <form onSubmit={handleSubmitAnswer} className="mt-3">
                        <textarea
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none mb-2"
                          placeholder="Enter your answer..."
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={submittingAnswer}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {submittingAnswer ? 'Submitting...' : 'Submit Answer'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedQuestion(null);
                              setAnswerText('');
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

