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
        'bg-panel-toggle-background-alt w-36 text-panel-toggle-text-alt rounded-lg mr-2 py-3 px-4 hover:bg-panel-toggle-background-hover',
        !secondaryActive && '!bg-panel-toggle-background text-panel-toggle-text',
      )}
    >
      {mainTitle}
    </Button>
    <Button
      onClick={() => setSecondaryActive(true)}
      className={cx(
        'bg-panel-toggle-background-alt text-panel-toggle-text-alt rounded-lg w-36 py-3 px-4 hover:bg-panel-toggle-background-hover',
        secondaryActive && '!bg-panel-toggle-background text-panel-toggle-text',
      )}
    >
      {secondaryTitle}
    </Button>
  </>
);

export default DashboardTitleToggle;
