// @flow
import PropTypes from 'prop-types';
import React from 'react';

class GeneralQueue extends React.Component {
  static propTypes = {
    count: PropTypes.number,
  };

  render() {
    const { count } = this.props;
    return (
      <li className="notification">
        <a className="dropdown-toggle">
          <i className="fa fa-list-alt" />
          {count == null ? null : <span className="badge bg-success">{count}</span>}
        </a>
      </li>
    );
  }
}

export default GeneralQueue;
