import React, { type ReactNode } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

type Props = {
  title: ReactNode;
  children: React.ReactNode;
  options?: React.ReactNode;
  className?: string;
  isFetching?: boolean;
  editMode?: boolean;
  fullHeight?: boolean;
  disableOverflow?: boolean;
  transparent?: boolean;
  contentClassName?: string | boolean;
  sticky?: boolean;
};

const ShokoPanel = (
  {
    children,
    className,
    contentClassName,
    disableOverflow = false,
    editMode,
    fullHeight = true,
    isFetching,
    options,
    sticky,
    title,
    transparent = false,
  }: Props,
) => (
  <div
    className={cx(
      'flex flex-col transition-colors border rounded-lg p-6 gap-y-6',
      fullHeight && 'h-full',
      editMode ? 'pointer-events-none border-panel-text-primary' : 'border-panel-border',
      transparent ? 'bg-panel-background-transparent' : 'bg-panel-background',
      sticky && 'sticky top-0',
      className,
    )}
  >
    <div className="flex flex-wrap items-center justify-between">
      <span className="flex text-xl font-semibold">{title}</span>
      <div
        className="flex"
        onMouseDown={event => event.stopPropagation()}
        onTouchStart={event => event.stopPropagation()}
      >
        {options}
      </div>
    </div>
    <div
      className={cx(
        'flex grow flex-col shoko-scrollbar',
        !disableOverflow && 'overflow-y-auto',
        contentClassName,
      )}
      style={{ overflowAnchor: 'none' }} // To fix scroll jumping around randomly when queue items change
    >
      {isFetching
        ? (
          <div className="flex grow items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} spin size={3} />
          </div>
        )
        : children}
    </div>
  </div>
);

export default ShokoPanel;
