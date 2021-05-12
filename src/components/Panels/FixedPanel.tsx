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
      <div className={`${className ?? ''} flex flex-col overflow-hidden rounded shadow-sm fixed-panel h-full px-5 py-4`}>
        <div className="flex justify-between items-center">
          <span className="flex font-semibold text-xl2 uppercase fixed-panel-header">{title}</span>
          <div
            className="flex"
            onMouseDown={event => event.stopPropagation()}
            onTouchStart={event => event.stopPropagation()}
          >
            {options}
          </div>
        </div>
        <span className="bg-color-accent-secondary my-2 h-1 w-10 flex-shrink-0" />
        <div
          className="overflow-y-auto flex flex-col h-full font-mulish"
          onMouseDown={event => event.stopPropagation()}
          onTouchStart={event => event.stopPropagation()}
        >
          {isFetching ? (
            <div className="flex justify-center items-center h-full">
              <FontAwesomeIcon icon={faCircleNotch} spin className="text-6xl color-accent-secondary" />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    );
  }
}

export default FixedPanel;
