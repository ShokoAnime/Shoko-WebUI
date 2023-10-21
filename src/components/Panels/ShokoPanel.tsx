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
  contentClassName?: string;
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
    title,
    transparent = false,
  }: Props,
) => (
  <div
    className={cx(
      'flex flex-col overflow-hidden transition-colors border rounded p-8',
      fullHeight && 'h-full',
      editMode ? 'pointer-events-none border-panel-text-primary' : 'border-panel-border',
      transparent ? 'bg-panel-background-transparent' : 'bg-panel-background',
      className,
    )}
  >
    <div className="mb-8 flex items-center justify-between">
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
        disableOverflow === false && 'overflow-y-auto',
        contentClassName,
      )}
    >
      {isFetching
        ? (
          <div className="flex grow items-center justify-center">
            <Icon path={mdiLoading} spin size={1} />
          </div>
        )
        : children}
    </div>
  </div>
);

export default ShokoPanel;
