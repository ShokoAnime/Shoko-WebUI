import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import FixedPanel from '../../components/Panels/FixedPanel';
import CommandsItem from './CommandsItem';
import CommandsItemStatus from './CommandsItemStatus';

class Commands extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    isFetching: PropTypes.bool,
    lastUpdated: PropTypes.number,
    autoUpdate: PropTypes.bool,
    items: PropTypes.object,
  };

  render() {
    const { items, isFetching, lastUpdated, className } = this.props;
    let commands = [];
    forEach(items, (item, key) => {
      commands.push(
        <CommandsItem
          key={`main-${key}`}
          count={item.count}
          name={key}
        />
      );
      commands.push(<CommandsItemStatus key={`details-${key}`} state={item.state} />);
    });

    return (
      <div className={className}>
        <FixedPanel
          title="Commands"
          description="Commands currently being processed"
          lastUpdated={lastUpdated}
          isFetching={isFetching}
        >
          <table className="table">
            <tbody>
            {commands}
            </tbody>
          </table>
        </FixedPanel>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { queueStatus } = state;
  const {
    isFetching,
    lastUpdated,
    items,
  } = queueStatus || {
    isFetching: true,
    items: [],
  };

  return {
    items,
    isFetching,
    lastUpdated,
  };
}

export default connect(mapStateToProps)(Commands);
