import React from 'react';
import cx from 'classnames';

const DashboardTitleToggle = ({ mainTitle, secondaryTitle, secondaryActive, setSecondaryActive }: { mainTitle: string; secondaryTitle: string; secondaryActive: boolean; setSecondaryActive(value: boolean): void }) => (<div>
  <span className="px-2">&gt;</span>
  <span className={cx({ 'cursor-pointer': true, 'font-semibold': !secondaryActive, 'text-highlight-1': !secondaryActive })} onClick={() => setSecondaryActive(false)}>{mainTitle}</span>
<span className="mx-2">|</span>
<span className={cx({ 'cursor-pointer': true, 'font-semibold': secondaryActive, 'text-highlight-1': secondaryActive })} onClick={() => setSecondaryActive(true)}>{secondaryTitle}</span>
</div>
);

export default DashboardTitleToggle;