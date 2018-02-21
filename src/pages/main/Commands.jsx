import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import FixedPanel from '../../components/Panels/FixedPanel';
import CommandsItem from './CommandsItem';
import CommandsItemStatus from './CommandsItemStatus';

class Commands extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    items: PropTypes.object,
  };

  render() {
    const { items, className } = this.props;
    const commands = [];
    forEach(items, (item, key) => {
      commands.push(<CommandsItem
        key={`main-${key}`}
        count={item.count}
        name={key}
      />);
      commands.push(<CommandsItemStatus key={`details-${key}`} state={item.state} />);
    });

    return (
      <div className={className}>
        <FixedPanel
          title="Commands"
          description="Commands currently being processed"
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

  return {
    items: queueStatus,
  };
}

export default connect(mapStateToProps)(Commands);
