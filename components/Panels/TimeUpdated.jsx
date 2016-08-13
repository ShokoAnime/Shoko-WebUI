import React, { PropTypes } from 'react';
import moment from 'moment';

class TimeUpdated extends React.Component {
  static propTypes = {
    timestamp: PropTypes.number,
    className: PropTypes.string,
    isFetching: PropTypes.bool,
  };

  render() {
    const { timestamp, className, isFetching } = this.props;
    let dateString = (timestamp) ? moment(timestamp, 'x').format('YYYY-MM-DD HH:mm:ss') : '--';
    return (
      <span className={className}>
        {isFetching ? <i className="fa fa-refresh fa-spin" /> : null}
        {dateString}
      </span>
    );
  }
}

export default TimeUpdated;
