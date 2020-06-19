import React from 'react';

type Props = {
  title: any;
  children: any;
  options?: any;
  className?: string;
};

class FixedPanel extends React.Component<Props> {
  render() {
    const {
      children, title, className, options,
    } = this.props;

    return (
      <div className={`${className ?? ''} flex flex-col overflow-hidden rounded shadow-sm fixed-panel h-full p-5`}>
        <div className="flex justify-between items-center">
          <span className="flex font-semibold text-xl2 uppercase fixed-panel-header">{title}</span>
          <div className="flex">
            {options}
          </div>
        </div>
        <div className="bg-color-accent-secondary my-2 h-1 w-10 flex-shrink-0" />
        <div className="overflow-y-auto flex flex-col h-full font-muli">
          {children}
        </div>
      </div>
    );
  }
}

export default FixedPanel;
