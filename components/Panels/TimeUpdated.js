import React, {PropTypes} from 'react';
import moment from 'moment';

class TimeUpdated extends React.Component {
  static propTypes = {
    timestamp: PropTypes.number,
    className: PropTypes.string
  };

  render() {
    const { timestamp, className } = this.props;
    let dateString = (timestamp)?moment(timestamp, 'x').format("YYYY-MM-DD HH:mm:ss"):'--';
    return (
      <span className={className}>{dateString}</span>
    );
  }
}

export default TimeUpdated