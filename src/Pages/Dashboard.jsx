import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  createFeedbackLink,
  fetchActiveLinks,
  fetchInactiveLinks,
  activateLink,
  deactivateLink,
  selectActiveLinks,
  selectInactiveLinks,
  selectLinksStatus,
  selectLinksError,
} from '../features/feedbackLinks/feedbackLinksSlice';

export const Dashboard = () => {
  const [newLink, setNewLink] = useState({
    title: '',
    description: '',
    slug: '',
  });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activeLinks = useSelector(selectActiveLinks);
  const inactiveLinks = useSelector(selectInactiveLinks);
  const status = useSelector(selectLinksStatus);
  const linksError = useSelector(selectLinksError);

  useEffect(() => {
    dispatch(fetchActiveLinks());
    dispatch(fetchInactiveLinks());
  }, [dispatch]);

  const handleChange = (e) => {
    setNewLink({ ...newLink, [e.target.name]: e.target.value });
    setError('');
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      await dispatch(createFeedbackLink(newLink)).unwrap();
      setNewLink({ title: '', description: '', slug: '' });
      dispatch(fetchActiveLinks());
      dispatch(fetchInactiveLinks());
    } catch (err) {
      setError(err.message || 'Failed to create feedback link');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleLink = async (link, isActive) => {
    try {
      if (isActive) {
        await dispatch(deactivateLink(link.id)).unwrap();
      } else {
        await dispatch(activateLink(link.id)).unwrap();
      }
      dispatch(fetchActiveLinks());
      dispatch(fetchInactiveLinks());
    } catch (err) {
      setError(err.message || 'Failed to update link status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your feedback links
            </p>
          </div>
          <Link
            to="/links"
            className="btn-primary px-4 py-2 text-sm"
          >
            Browse Public Links
          </Link>
        </div>

        {linksError && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">
            {linksError}
          </div>
        )}

        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Create New Feedback Link
          </h2>
          <form onSubmit={handleCreateLink} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label" htmlFor="title">
                  Link Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="input"
                  placeholder="e.g., Product Feedback"
                  value={newLink.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="description">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  className="input"
                  placeholder="Brief description..."
                  value={newLink.description}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label" htmlFor="slug">
                  Slug (URL-friendly)
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  className="input"
                  placeholder="e.g., product-feedback"
                  value={newLink.slug}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creating || status === 'loading'}
              className="btn-primary w-full md:w-auto py-3"
            >
              {creating || status === 'loading' ? 'Creating...' : 'Create Link'}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                Active Links ({activeLinks.length})
              </h2>
              <span className="badge-active">Accepting Replies</span>
            </div>
            {activeLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No active links yet. Create one above!
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {activeLinks.map((link) => (
                  <li key={link.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-medium">
                        #{link.id}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {link.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {link.slug}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleLink(link, true)}
                      className="btn-warning text-xs px-3 py-1.5"
                    >
                      Deactivate
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Inactive Links ({inactiveLinks.length})
              </h2>
              <span className="badge-inactive">Not Accepting Replies</span>
            </div>
            {inactiveLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No inactive links yet.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {inactiveLinks.map((link) => (
                  <li key={link.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-medium">
                        #{link.id}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {link.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {link.slug}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleLink(link, false)}
                      className="btn-success text-xs px-3 py-1.5"
                    >
                      Activate
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
