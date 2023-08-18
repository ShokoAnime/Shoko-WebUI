import React from 'react';
import cx from 'classnames';

const CountIcon = ({ children, className, show = true }) => (
  show
    ? (
      <div
        className={cx(
          'px-3 py-1 rounded font-semibold text-overlay-count-text text-center min-w-[1.75rem] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]',
          className,
        )}
      >
        {children}
      </div>
    )
    : null
);

export default CountIcon;
