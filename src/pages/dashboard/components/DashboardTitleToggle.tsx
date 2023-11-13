import React from 'react';
import cx from 'classnames';

import Button from '@/components/Input/Button';

type Props = {
  mainTitle: string;
  secondaryTitle: string;
  secondaryActive: boolean;
  setSecondaryActive(value: boolean): void;
};

const DashboardTitleToggle = ({
  mainTitle,
  secondaryActive,
  secondaryTitle,
  setSecondaryActive,
}: Props) => (
  <>
    <Button
      onClick={() => setSecondaryActive(false)}
      className={cx(
        'px-3 py-2 rounded-l-md rounded-r-none border border-panel-border w-36',
        !secondaryActive && 'bg-panel-input text-panel-text-primary',
      )}
    >
      {mainTitle}
    </Button>
    <Button
      onClick={() => setSecondaryActive(true)}
      className={cx(
        'px-3 py-2 rounded-l-none rounded-r-md border border-l-0 border-panel-border w-36',
        secondaryActive && 'bg-panel-input text-panel-text-primary',
      )}
    >
      {secondaryTitle}
    </Button>
  </>
);

export default DashboardTitleToggle;
