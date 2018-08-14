// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

type Props = {
  count: number,
}

class ImageQueue extends React.Component<Props> {
  static propTypes = {
    count: PropTypes.number,
  };

  render() {
    const { count } = this.props;
    return (
      <li className="notification">
        <a className="dropdown-toggle">
          <i className="fa fa-picture-o" />
          {count && (
            <span className="badge bg-info">
              {count}
            </span>
          )}
        </a>
      </li>
    );
  }
}

function mapStateToProps(state): Props {
  const { queueStatus } = state;
  const items = queueStatus.items || {};

  return {
    count: items.image ? items.image.count : 0,
  };
}

export default connect(mapStateToProps)(ImageQueue);
