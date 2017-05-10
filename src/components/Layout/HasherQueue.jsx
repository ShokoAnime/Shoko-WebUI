// @flow
import PropTypes from 'prop-types';
import React from 'react';

class HasherQueue extends React.Component {
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

export default HasherQueue;
