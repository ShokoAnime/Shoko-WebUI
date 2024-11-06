import React from 'react';
import cx from 'classnames';

import { MatchRatingType } from '@/core/types/api/episode';

const getAbbreviation = (rating?: MatchRatingType) => {
  switch (rating) {
    case MatchRatingType.DateAndTitleMatches:
      return ['DT', 'Date & Title'];
    case MatchRatingType.DateAndTitleKindaMatches:
      return ['~DT', 'Date & Approx. Title'];
    case MatchRatingType.DateMatches:
      return ['D', 'Date'];
    case MatchRatingType.TitleMatches:
      return ['T', 'Title'];
    case MatchRatingType.TitleKindaMatches:
      return ['~T', 'Approx. Title'];
    case MatchRatingType.UserVerified:
      return ['UO', 'User Override'];
    case MatchRatingType.FirstAvailable:
      return ['BG', 'Best Guess'];
    default:
      return ['', ''];
  }
};

type Props = {
  isDisabled: boolean;
  isOdd: boolean;
  rating?: MatchRatingType;
};

const MatchRating = React.memo(({ isDisabled, isOdd, rating }: Props) => (
  <div
    className={cx(
      'flex justify-center items-center rounded-md border border-panel-border w-16 text-button-primary-text',
      {
        'bg-panel-text-important': rating === MatchRatingType.DateAndTitleMatches
          || rating === MatchRatingType.TitleMatches,
        'bg-panel-text-warning': rating === MatchRatingType.DateMatches || rating === MatchRatingType.TitleKindaMatches
          || rating === MatchRatingType.DateAndTitleKindaMatches,
        'bg-panel-text-primary': rating === MatchRatingType.UserVerified,
        'bg-panel-text-danger': rating === MatchRatingType.FirstAvailable,
        'bg-panel-background': (!rating || rating === MatchRatingType.None) && !isOdd,
        'bg-panel-background-alt': (!rating || rating === MatchRatingType.None) && isOdd,
        'opacity-65': isDisabled,
      },
    )}
    data-tooltip-id="tooltip"
    data-tooltip-content={getAbbreviation(rating)[1]}
  >
    {getAbbreviation(rating)[0]}
  </div>
));

export default MatchRating;
