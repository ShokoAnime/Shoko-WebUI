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
        'bg-panel-background-alt w-36 rounded-lg mr-2 py-3 px-4',
        !secondaryActive && 'bg-panel-menu-item-background text-panel-menu-item-text',
      )}
    >
      {mainTitle}
    </Button>
    <Button
      onClick={() => setSecondaryActive(true)}
      className={cx(
        'bg-panel-background-alt rounded-lg w-36 py-3 px-4',
        secondaryActive && 'bg-panel-menu-item-background text-panel-menu-item-text',
      )}
    >
      {secondaryTitle}
    </Button>
  </>
);

export default DashboardTitleToggle;
