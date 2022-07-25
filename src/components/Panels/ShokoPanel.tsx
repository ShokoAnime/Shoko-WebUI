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
};

const ShokoPanel = ({ className, title, options, children, isFetching }: Props) => (
    <div className={cx(['flex', 'flex-col', 'overflow-hidden', 'h-full'], className)}>
        <div className="flex justify-between items-center mr-2">
          <span className="flex font-semibold text-base">{title}</span>
            <div
                className="flex"
                onMouseDown={event => event.stopPropagation()}
                onTouchStart={event => event.stopPropagation()}
            >
                {options}
            </div>
        </div>
      <span className="bg-background-border my-4 h-0.5 flex-shrink-0" />
      <div className="flex grow flex-col mr-2 font-open-sans">
        {isFetching ? <div className="flex grow justify-center items-center"><Icon path={mdiLoading} spin size={1} /></div> : children}
      </div>
    </div>
);

export default ShokoPanel;