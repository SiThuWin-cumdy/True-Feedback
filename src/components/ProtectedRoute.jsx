import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { fetchMe, selectAuthStatus, selectToken, selectUser } from '../features/auth/authSlice';
import { ConnectionError, PageLoader } from './PageState';

// App restores the session; these routes wait for it.

export const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const status = useSelector(selectAuthStatus);

  if (user) return <Outlet />;
  if (!token) return <Navigate to="/login" replace />;
  if (status === 'failed') return <ConnectionError onRetry={() => dispatch(fetchMe())} />;
  return <PageLoader />;
};

// For pages that only make sense signed out.
export const GuestRoute = () => {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const status = useSelector(selectAuthStatus);

  if (user) return <Navigate to="/dashboard" replace />;
  if (token && status !== 'failed') return <PageLoader />;
  return <Outlet />;
};
