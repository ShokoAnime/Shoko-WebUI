import React from 'react';
import cx from 'classnames';

import { MatchRatingType } from '@/core/types/api/episode';

const getAbbreviation = (rating?: MatchRatingType) => {
  switch (rating) {
    case MatchRatingType.DateAndTitleMatches:
      return 'DT';
    case MatchRatingType.DateMatches:
    case MatchRatingType.TitleMatches:
      return 'D/T';
    case MatchRatingType.UserVerified:
      return 'UO';
    case MatchRatingType.FirstAvailable:
      return 'BG';
    default:
      return '';
  }
};

const MatchRating = ({ rating }: { rating?: MatchRatingType }) => (
  <div
    className={cx(
      'flex justify-center items-center rounded-md w-14 text-button-primary-text',
      {
        'bg-panel-text-important': rating === MatchRatingType.DateAndTitleMatches,
        'bg-panel-text-warning': rating === MatchRatingType.DateMatches || rating === MatchRatingType.TitleMatches,
        'bg-panel-text-primary': rating === MatchRatingType.UserVerified,
        'bg-panel-text-danger': rating === MatchRatingType.FirstAvailable,
      },
    )}
  >
    {getAbbreviation(rating)}
  </div>
);

export default MatchRating;
