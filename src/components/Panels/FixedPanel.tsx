import React from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

type Props = {
  title: string;
  children: any;
  options?: any;
  className?: string;
  isFetching?: boolean;
};

function FixedPanel(props: Props) {
  const {
    children, title, className, options,
    isFetching,
  } = props;

  return (
    <div className={`${className ?? ''} flex flex-col overflow-hidden rounded-xl shadow-sm bg-color-1 h-full pl-5 pr-3 py-4`}>
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
      <span
        className="bg-highlight-2 my-2 h-1 flex-shrink-0"
        style={{
          width: `${title.length / 1.25}rem`,
        }}
      />
      <div
        className="overflow-y-auto flex flex-col h-full font-open-sans"
        onMouseDown={event => event.stopPropagation()}
        onTouchStart={event => event.stopPropagation()}
      >
        {isFetching ? (
          <div className="flex justify-center items-center h-full">
            <Icon path={mdiLoading} spin size={1} />
          </div>
        ) : (
          <div className="flex flex-col mr-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default FixedPanel;
