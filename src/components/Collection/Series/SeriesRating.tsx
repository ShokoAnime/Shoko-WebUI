import React, { useState } from 'react';
import { mdiStar, mdiStarOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { toNumber } from 'lodash';

import { useVoteSeriesMutation } from '@/core/react-query/series/mutations';
import useEventCallback from '@/hooks/useEventCallback';

type Props = {
  seriesId: number;
  ratingValue: number;
};

type StarIconProps = {
  hovered: boolean;
  index: string;
  handleHover: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleVote: (event: React.MouseEvent<HTMLDivElement>) => void;
};

const StarIcon = React.memo(({ handleHover, handleVote, hovered, index }: StarIconProps) => (
  <div
    id={index}
    className="cursor-pointer text-panel-text-primary"
    onMouseEnter={handleHover}
    onClick={handleVote}
  >
    <Icon path={hovered ? mdiStar : mdiStarOutline} size={1} />
  </div>
));

const SeriesRating = ({ ratingValue, seriesId }: Props) => {
  const { mutate: voteSeries } = useVoteSeriesMutation(seriesId);

  const [hoveredStar, setHoveredStar] = useState(ratingValue - 1);

  const handleVote = useEventCallback((event: React.MouseEvent<HTMLDivElement>) => {
    voteSeries(toNumber(event.currentTarget.id) + 1);
  });

  const handleClear = useEventCallback(() => {
    setHoveredStar(ratingValue - 1);
  });

  const handleHover = useEventCallback((event: React.MouseEvent<HTMLDivElement>) => {
    setHoveredStar(toNumber(event.currentTarget.id));
  });

  return (
    <div className="flex gap-x-0.5" id="-1" onMouseLeave={handleClear}>
      {Array.from({ length: 10 }).map((_, index) => (
        <StarIcon
          // eslint-disable-next-line react/no-array-index-key
          key={`star-${index}`}
          index={index.toString()}
          hovered={hoveredStar >= index}
          handleHover={handleHover}
          handleVote={handleVote}
        />
      ))}
    </div>
  );
};

export default SeriesRating;
