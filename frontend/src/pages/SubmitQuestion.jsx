import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Toast from '../components/Toast';

const SubmitQuestion = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { isAuthenticated, user } = useAuth();

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      showToast('Please enter a question', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/questions', { message: question });
      showToast('Question submitted successfully!', 'success');
      setQuestion('');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit question', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-800">Q&A Dashboard</h1>
            <div className="flex gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <span className="px-4 py-2 text-gray-700">
                    Welcome, {user?.username}
                  </span>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Submit Your Question
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Ask your question below. You can view all questions on the dashboard.
          </p>

          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                Your Question
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Enter your question here..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
            >
              {loading ? 'Submitting...' : 'Submit Question'}
            </button>
          </form>

          {isAuthenticated && (
            <div className="mt-8 text-center">
              <Link
                to="/dashboard"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View Dashboard →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitQuestion;


