import { useParams } from 'react-router-dom';
import { OwnedLinkPage } from '../components/OwnedLinkPage';
import { RepliesSection } from '../components/RepliesSection';

export const Replies = () => {
  const { id } = useParams();

  return (
    <OwnedLinkPage id={id}>
      {(link) => (
        <RepliesSection
          linkId={link._id}
          emptyText="No replies yet. Copy the link above and share it wherever your audience is."
        />
      )}
    </OwnedLinkPage>
  );
};
