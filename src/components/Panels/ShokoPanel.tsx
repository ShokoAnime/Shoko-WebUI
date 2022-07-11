import React, { ReactNode } from 'react';

type Props = {
  title: string;
  children: any;
  options?: any;
  className?: string;
  isFetching?: boolean; 
  titleTabs?: ReactNode;
};

const ShokoPanel = ({ className, title, options, children, titleTabs }: Props) => (
    <div className={`${className ?? ''} flex flex-col overflow-hidden h-full`}>
        <div className="flex justify-between items-center mr-2">
          <span className="flex font-semibold text-xl">{title}{titleTabs}</span>
            <div
                className="flex"
                onMouseDown={event => event.stopPropagation()}
                onTouchStart={event => event.stopPropagation()}
            >
                {options}
            </div>
        </div>
      <span className="bg-background-border my-2 h-0.5 flex-shrink-0" />
      <div className="flex flex-col mr-2 font-rubik">
        {children}
      </div>
    </div>
);

export default ShokoPanel;