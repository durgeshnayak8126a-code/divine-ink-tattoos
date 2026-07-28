import { useEffect } from 'react';

export default function AdminMeta({ title }) {
  useEffect(() => {
    const previousTitle = document.title;
    const robotsMeta = document.head.querySelector('meta[name="robots"]');
    const previousRobots = robotsMeta?.getAttribute('content') || '';

    document.title = title;
    robotsMeta?.setAttribute('content', 'noindex, nofollow, noarchive');

    return () => {
      document.title = previousTitle;
      robotsMeta?.setAttribute('content', previousRobots);
    };
  }, [title]);

  return null;
}

