import cx from 'classnames';

import type { MatchRatingValues } from '@/core/types/api/episode';

const getAbbreviation = (rating?: MatchRatingValues) => {
  switch (rating) {
    case 'DateAndTitleMatches':
      return ['DT', 'Date & Title'];
    case 'DateAndTitleKindaMatches':
      return ['~DT', 'Date & Approx. Title'];
    case 'DateMatches':
      return ['D', 'Date'];
    case 'TitleMatches':
      return ['T', 'Title'];
    case 'TitleKindaMatches':
      return ['~T', 'Approx. Title'];
    case 'DateKindaMatches':
      return ['~D', 'Approx. Date'];
    case 'UserVerified':
      return ['UO', 'User Override'];
    case 'FirstAvailable':
      return ['BG', 'Best Guess'];
    default:
      return ['', ''];
  }
};

type Props = {
  isDisabled: boolean;
  isOdd: boolean;
  rating?: MatchRatingValues;
};

const MatchRating = ({ isDisabled, isOdd, rating }: Props) => (
  <div
    className={cx(
      'flex w-16 items-center justify-center rounded-md border border-panel-border text-button-primary-text',
      {
        'bg-panel-text-important': rating === 'DateAndTitleMatches'
          || rating === 'TitleMatches',
        'bg-panel-text-warning': rating === 'DateMatches' || rating === 'TitleKindaMatches'
          || rating === 'DateAndTitleKindaMatches' || rating === 'DateKindaMatches',
        'bg-panel-text-primary': rating === 'UserVerified',
        'bg-panel-text-danger': rating === 'FirstAvailable',
        'bg-panel-background': (!rating || rating === 'None') && !isOdd,
        'bg-panel-background-alt': (!rating || rating === 'None') && isOdd,
        'opacity-65': isDisabled,
      },
    )}
    data-tooltip-id="tooltip"
    data-tooltip-content={getAbbreviation(rating)[1]}
  >
    {getAbbreviation(rating)[0]}
  </div>
);

export default MatchRating;
