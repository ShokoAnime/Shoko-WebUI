import React from 'react';
import cx from 'classnames';

import { MatchRatingType } from '@/core/types/api/episode';

const getAbbreviation = (rating?: MatchRatingType) => {
  switch (rating) {
    case MatchRatingType.DateAndTitleMatches:
      return 'DT';
    case MatchRatingType.DateMatches:
      return 'D';
    case MatchRatingType.TitleMatches:
      return 'T';
    case MatchRatingType.UserVerified:
      return 'UO';
    case MatchRatingType.FirstAvailable:
      return 'BG';
    default:
      return '';
  }
};

const MatchRating = ({ isOdd, rating }: { isOdd: boolean, rating?: MatchRatingType }) => (
  <div
    className={cx(
      'flex justify-center items-center rounded-md border border-panel-border  w-14 text-button-primary-text',
      {
        'bg-panel-text-important': rating === MatchRatingType.DateAndTitleMatches,
        'bg-panel-text-warning': rating === MatchRatingType.DateMatches || rating === MatchRatingType.TitleMatches,
        'bg-panel-text-primary': rating === MatchRatingType.UserVerified,
        'bg-panel-text-danger': rating === MatchRatingType.FirstAvailable,
        'bg-panel-background': !rating && !isOdd,
        'bg-panel-background-alt': !rating && isOdd,
      },
    )}
  >
    {getAbbreviation(rating)}
  </div>
);

export default MatchRating;
