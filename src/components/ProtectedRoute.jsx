import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMe, selectUser, selectAuthStatus } from '../features/auth/authSlice';

export const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const authStatus = useSelector(selectAuthStatus);

  useEffect(() => {
    if (authStatus === 'idle' && !user) {
      const token = localStorage.getItem('token');
      if (token) {
        dispatch(fetchMe());
      } else {
        navigate('/login');
      }
    }
  }, [dispatch, navigate, user, authStatus]);

  if (authStatus === 'loading' && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
};