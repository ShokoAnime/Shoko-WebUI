import React from 'react';

type Props = {
  title: string;
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
      <div className={`${className ?? ''} flex flex-col overflow-hidden rounded shadow-sm fixed-panel h-full px-5 py-4`}>
        <div className="flex justify-between items-center">
          <span className="flex font-semibold text-xl2 uppercase fixed-panel-header">{title}</span>
          <div className="flex">
            {options}
          </div>
        </div>
        <span className="bg-color-accent-secondary mt-2 h-1 w-10 flex-shrink-0" />
        <div className="overflow-y-auto flex flex-col h-full font-muli">
          {children}
        </div>
      </div>
    );
  }
}

export default FixedPanel;
