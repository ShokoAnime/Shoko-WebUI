import React from 'react';

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export const Badge = ({ children, className }: BadgeProps) => (
  <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${className ?? ''}`.trim()}>
    {children}
  </span>
);
