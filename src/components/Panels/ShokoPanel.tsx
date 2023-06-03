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
  disableOverflow?: boolean;
  transparent?: boolean;
};

const ShokoPanel = ({ className, title, options, children, isFetching, editMode, fullHeight = true, disableOverflow = false, transparent = false }: Props) => (
    <div className={cx('flex flex-col overflow-hidden transition-colors border rounded p-8', fullHeight && 'h-full', editMode ? 'pointer-events-none border-highlight-1' : 'border-background-border', transparent ? ' bg-background-alt/50' : ' bg-background-alt', className)}>
      <div className="flex justify-between items-center mb-8">
        <span className="flex font-semibold text-xl">{title}</span>
          <div
              className="flex"
              onMouseDown={event => event.stopPropagation()}
              onTouchStart={event => event.stopPropagation()}
          >
              {options}
          </div>
      </div>
      <div className={cx('flex grow flex-col shoko-scrollbar', disableOverflow === false && 'overflow-y-auto')}>
        {isFetching ? <div className="flex grow justify-center items-center"><Icon path={mdiLoading} spin size={1} /></div> : children}
      </div>
    </div>
);

export default ShokoPanel;
