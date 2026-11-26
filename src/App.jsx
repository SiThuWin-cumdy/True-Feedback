import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './Pages/Login';
import { Signup } from './Pages/Signup';
import { Dashboard } from './Pages/Dashboard';
import { FeedbackLink } from './Pages/FeedbackLink';
import { Replies } from './Pages/Replies';
import { PublicLink } from './Pages/PublicLink';
import { fetchMe, selectAuthStatus, selectToken, selectUser } from './features/auth/authSlice';
import { BASE_PATH } from './lib/links';
import TawkChat from './components/TawkChat';

const toastOptions = {
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
};

// A saved token without a user means the session still has to be restored.
const useRestoreSession = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const status = useSelector(selectAuthStatus);

  useEffect(() => {
    if (token && !user && status === 'idle') dispatch(fetchMe());
  }, [dispatch, token, user, status]);
};

function App() {
  useRestoreSession();
  const user = useSelector(selectUser); 


  return (
    <Router basename={BASE_PATH}>
      <div className="min-h-screen bg-paper text-ink">
        <Toaster position="top-center" toastOptions={toastOptions} />
        <Navbar />
        <TawkChat  visible={user} user={user}/>

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/links/:id" element={<FeedbackLink />} />
            <Route path="/links/:id/replies" element={<Replies />} />
          </Route>

          {/* Add new top-level paths to RESERVED_SLUGS in lib/links.js. */}
          <Route path="/:slug" element={<PublicLink />} />
        </Routes>
      </div>

    </Router>
  );
}

export default App;
