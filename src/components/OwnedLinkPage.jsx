import { useOwnedLink } from '../hooks/useLink';
import { LinkHeader } from './LinkHeader';
import { BackLink, ConnectionError, PageLoader, PageMessage } from './PageState';

// Loads one of the user's links and renders its header, then `children(link)`.
export const OwnedLinkPage = ({ id, children }) => {
  const { link, loading, error, retry } = useOwnedLink(id);

  if (loading) return <PageLoader label="Loading link" />;
  if (error && !error.status) return <ConnectionError onRetry={retry} />;
  if (!link) {
    return (
      <PageMessage title="Link not found" action="Back to your links" actionTo="/dashboard">
        This feedback link doesn't exist, or it belongs to another account.
      </PageMessage>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <BackLink to="/dashboard">All links</BackLink>
      <LinkHeader link={link} />
      {children(link)}
    </main>
  );
};
