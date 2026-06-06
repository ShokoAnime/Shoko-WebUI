import React from 'react';
import cx from 'classnames';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const Badge = ({ children, className }: Props) => (
  <span className={cx('rounded-lg px-2.5 py-1 text-xs font-semibold', className)}>
    {children}
  </span>
);
