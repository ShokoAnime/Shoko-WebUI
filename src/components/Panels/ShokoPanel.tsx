import React, { ReactNode } from 'react';
import { Icon } from '@mdi/react';
import { mdiLoading } from '@mdi/js';

type Props = {
  title: string;
  children: any;
  options?: any;
  className?: string;
  isFetching?: boolean; 
  titleTabs?: ReactNode;
};

const ShokoPanel = ({ className, title, options, children, titleTabs, isFetching }: Props) => (
    <div className={`${className ?? ''} flex flex-col overflow-hidden h-full`}>
        <div className="flex justify-between items-center mr-2">
          <span className="flex font-semibold text-base">{title}{titleTabs}</span>
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