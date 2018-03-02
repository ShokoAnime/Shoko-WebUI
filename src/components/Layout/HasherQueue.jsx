// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

type Props = {
  count: number,
}

class HasherQueue extends React.Component<Props> {
  static propTypes = {
    count: PropTypes.number,
  };

  render() {
    const { count } = this.props;
    return (
      <li className="notification">
        <a className="dropdown-toggle">
          <i className="fa fa-tasks" />
          {count == null ? null : <span className="badge bg-error">{count}</span>}
        </a>
      </li>
    );
  }
}

function mapStateToProps(state):Props {
  const { queueStatus } = state;
  const items = queueStatus.items || {};

  return {
    count: items.hash ? items.hash.count : 0,
  };
}

export default connect(mapStateToProps, () => {})(HasherQueue);
