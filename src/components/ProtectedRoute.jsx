import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMe, selectUser, selectAuthStatus } from '../features/auth/authSlice';
import { PageLoader } from './PageState';

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
    return <PageLoader />;
  }

  if (!user) {
    return null;
  }

  return children;
};