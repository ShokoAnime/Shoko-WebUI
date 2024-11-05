import React from 'react';
import cx from 'classnames';

import { MatchRatingType } from '@/core/types/api/episode';

const getAbbreviation = (rating?: MatchRatingType) => {
  switch (rating) {
    case MatchRatingType.DateAndTitleMatches:
      return 'DT';
    case MatchRatingType.DateAndTitleKindaMatches:
      return '~DT';
    case MatchRatingType.DateMatches:
      return 'D';
    case MatchRatingType.TitleMatches:
      return 'T';
    case MatchRatingType.TitleKindaMatches:
      return '~T';
    case MatchRatingType.UserVerified:
      return 'UO';
    case MatchRatingType.FirstAvailable:
      return 'BG';
    default:
      return '';
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
  >
    {getAbbreviation(rating)}
  </div>
));

export default MatchRating;
