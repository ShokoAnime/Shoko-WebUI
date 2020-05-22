
import PropTypes from 'prop-types';
import React from 'react';

type OwnProps = {
  title: any;
  children: any;
};

type Props = OwnProps;

class FixedPanel extends React.Component<Props> {
  static propTypes = {
    title: PropTypes.any,
    children: PropTypes.any,
  };

  render() {
    const { children, title } = this.props;

    return (
      <div className="overflow-hidden rounded shadow-sm fixed-panel h-full flex flex-col p-5">
        <div className="font-semibold text-xl uppercase flex-none">
          {title}
        </div>
        <div className="bg-color-accent-secondary my-2 h-1 w-10 flex-none" />
        <div className="overflow-y-auto h-auto text-base fixed-panel-text">
          <table className="table-auto w-full">
            <tbody>{children}</tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default FixedPanel;
