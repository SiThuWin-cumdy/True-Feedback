import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { signOut, selectUser, selectAuthStatus } from '../features/auth/authSlice';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';

const navLinkClass = ({ isActive }) =>
  `text-sm font-semibold rounded-md px-2 py-1 transition-colors ${
    isActive ? 'text-ink' : 'text-muted hover:text-ink'
  }`;

export const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const authStatus = useSelector(selectAuthStatus);
  const signingOut = authStatus === 'loading';

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Logo to={user ? '/dashboard' : '/'} />

        <nav className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Links
              </NavLink>
              <span className="hidden sm:inline text-sm text-muted px-2 max-w-40 truncate">
                {user.username || user.email}
              </span>
              <button
                onClick={() => dispatch(signOut())}
                disabled={signingOut}
                className="btn-ghost px-2.5 sm:px-3"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{signingOut ? 'Signing out' : 'Sign out'}</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Sign in
              </NavLink>
              <Link to="/signup" className="btn-primary btn-sm ml-1">
                Create account
              </Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};
