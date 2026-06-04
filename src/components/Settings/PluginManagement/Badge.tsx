import React from 'react';
import cx from 'classnames';

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export const Badge = ({ children, className }: BadgeProps) => (
  <span className={cx('rounded-lg px-2.5 py-1 text-xs font-medium', className)}>
    {children}
  </span>
);
