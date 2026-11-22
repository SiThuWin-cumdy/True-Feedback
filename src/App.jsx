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
import { PublicLink } from './Pages/PublicLink';
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
    <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <div className="min-h-screen bg-paper text-ink">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--ink)',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              fontSize: '14px',
              boxShadow: 'none',
            },
            success: { iconTheme: { primary: 'var(--accent)', secondary: 'var(--surface)' } },
            error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--surface)' } },
          }}
        />
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
          <Route path="/:slug" element={<PublicLink />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
