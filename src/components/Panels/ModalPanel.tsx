import React from 'react';

type Props = {
  children: any;
  show: boolean;
  className?: string;
};

class ModalPanel extends React.Component<Props> {
  render() {
    const { children, show, className } = this.props;

    return (
      <div className="flex pointer-events-none fixed w-full inset-0 z-50">
        {show && (
          <div className="flex justify-center items-center h-full w-full bg-black bg-opacity-75">
            <div className={`${className ?? ''} flex flex-col pointer-events-auto fixed-panel rounded shadow-sm`}>
              {children}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ModalPanel;
