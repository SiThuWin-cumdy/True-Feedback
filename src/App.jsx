import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './Pages/Login';
import { Signup } from './Pages/Signup';
import { Dashboard } from './Pages/Dashboard';
import { FeedbackLink } from './Pages/FeedbackLink';
import { Replies } from './Pages/Replies';
import { Toaster } from 'react-hot-toast';
import { selectUser, selectAuthStatus } from './features/auth/authSlice';

function App() {
  const user = useSelector(selectUser);
  const authStatus = useSelector(selectAuthStatus);

  useEffect(() => {
    if (authStatus === 'idle' && !user) {
      const token = localStorage.getItem('token');
      if (token) {
        // ProtectedRoute will handle fetching user profile
      }
    }
  }, [authStatus, user]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Toaster position="top-right" />
        <Navbar />

        <Routes>
          <Route
            path="/login"
            element={
              user ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />
          <Route
            path="/signup"
            element={
              user ? <Navigate to="/dashboard" replace /> : <Signup />
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/links/:id"
            element={
              <ProtectedRoute>
                <FeedbackLink />
              </ProtectedRoute>
            }
          />
          <Route
            path="/links/:id/replies"
            element={
              <ProtectedRoute>
                <Replies />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
