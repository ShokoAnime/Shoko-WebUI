import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { getAnidbAnimeLink } from '@/core/util';

type Props = {
  anidbId: number | null;
  children: ReactNode;
  className?: string;
  shokoId: number | null;
  tooltip?: string;
};

/** A series in the collection links to its page, one outside it to AniDB in a new tab, and one without IDs is text. */
const SeriesLink = ({ anidbId, children, className, shokoId, tooltip }: Props) => {
  const props = {
    className,
    'data-tooltip-id': tooltip ? 'tooltip' : undefined,
    'data-tooltip-content': tooltip,
    'data-tooltip-delay-show': 500,
  };

  if (shokoId) return <Link to={`/webui/collection/series/${shokoId}`} {...props}>{children}</Link>;
  if (anidbId) {
    return <a href={getAnidbAnimeLink(anidbId)} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
  }
  return <span {...props}>{children}</span>;
};

export default SeriesLink;
