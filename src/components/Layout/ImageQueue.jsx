import PropTypes from 'prop-types';
import React from 'react';

class ImageQueue extends React.Component {
  static propTypes = {
    count: PropTypes.number,
  };

  render() {
    const { count } = this.props;
    return (
      <li className="notification">
        <a className="dropdown-toggle">
          <i className="fa fa-picture-o" />
          {count == null ? null : <span className="badge bg-info">{count}</span>}
        </a>
      </li>
    );
  }
}

export default ImageQueue;
