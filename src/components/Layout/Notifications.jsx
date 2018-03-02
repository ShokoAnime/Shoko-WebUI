// @flow
import PropTypes from 'prop-types';
import React from 'react';

type Props = {
  count?: number,
}

class Notifications extends React.Component<Props> {
  static propTypes = {
    count: PropTypes.number,
  };

  render() {
    const { count } = this.props;
    return (
      <li className="notification">
        <a className="dropdown-toggle">
          <i className="fa fa-bell-o" />
          {count == null ? null : <span className="badge bg-warning">{count}</span>}
        </a>
      </li>
    );
  }
}

export default Notifications;
