import React, { ReactNode } from 'react';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import { mdiLoading } from '@mdi/js';

type Props = {
  title: ReactNode;
  children: any;
  options?: any;
  className?: string;
  isFetching?: boolean;
  editMode?: boolean;
  fullHeight?: boolean;
};

const ShokoPanel = ({ className, title, options, children, isFetching, editMode, fullHeight = true }: Props) => (
    <div className={cx('flex flex-col overflow-hidden transition-colors border bg-background-alt rounded p-8', fullHeight && 'h-full', editMode ? 'pointer-events-none border-highlight-1' : 'border-background-border', className)}>
      <div className="flex justify-between items-center mb-8">
        <span className="flex font-semibold text-base">{title}</span>
          <div
              className="flex"
              onMouseDown={event => event.stopPropagation()}
              onTouchStart={event => event.stopPropagation()}
          >
              {options}
          </div>
      </div>
      <div className="flex grow flex-col font-open-sans overflow-y-auto shoko-scrollbar">
        {isFetching ? <div className="flex grow justify-center items-center"><Icon path={mdiLoading} spin size={1} /></div> : children}
      </div>
    </div>
);

export default ShokoPanel;
