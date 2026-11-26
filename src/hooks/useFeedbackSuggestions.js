import { useEffect, useState } from 'react';
import { feedbackLinksAPI } from '../features/feedbackLinks/feedbackLinksAPI';

const merge = (current, added) => [...new Set([...current, ...added])];

// AI writing prompts for a link. Optional help: failures leave what's there.
export const useFeedbackSuggestions = ({ title, description }) => {
  const enabled = Boolean(title && description); // the API requires both
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [round, setRound] = useState(0); // each round requests more

  useEffect(() => {
    if (!enabled) return undefined;

    let stale = false;
    feedbackLinksAPI
      .getFeedbackSuggestions(title, description)
      .then((result) => {
        if (stale || !Array.isArray(result)) return;
        const added = result.filter((item) => typeof item === 'string');
        setSuggestions((current) => merge(current, added));
      })
      .catch((error) => console.error('Could not load suggestions:', error))
      .finally(() => {
        if (!stale) setLoading(false);
      });

    return () => {
      stale = true;
    };
  }, [enabled, title, description, round]);

  const loadMore = () => {
    setLoading(enabled);
    setRound((current) => current + 1);
  };

  const restart = () => {
    setSuggestions([]);
    loadMore();
  };

  return { suggestions, loading, loadMore, restart };
};
