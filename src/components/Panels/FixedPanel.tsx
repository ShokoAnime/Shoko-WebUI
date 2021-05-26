import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

type Props = {
  title: string;
  children: any;
  options?: any;
  className?: string;
  isFetching?: boolean;
};

class FixedPanel extends React.Component<Props> {
  render() {
    const {
      children, title, className, options,
      isFetching,
    } = this.props;

    return (
      <div className={`${className ?? ''} flex flex-col overflow-hidden rounded-xl shadow-sm bg-color-1 h-full pl-5 pr-3 py-4`}>
        <div className="flex justify-between items-center mr-2">
          <span className="flex font-semibold text-xl">{title}</span>
          <div
            className="flex"
            onMouseDown={event => event.stopPropagation()}
            onTouchStart={event => event.stopPropagation()}
          >
            {options}
          </div>
        </div>
        <span
          className="bg-color-highlight-2 my-2 h-1 flex-shrink-0"
          style={{
            width: `${title.length / 1.25}rem`,
          }}
        />
        <div
          className="overflow-y-auto flex flex-col h-full font-mulish"
          onMouseDown={event => event.stopPropagation()}
          onTouchStart={event => event.stopPropagation()}
        >
          {isFetching ? (
            <div className="flex justify-center items-center h-full">
              <FontAwesomeIcon icon={faCircleNotch} spin className="text-6xl color-highlight-2" />
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
}

export default FixedPanel;
