import React, {PropTypes} from 'react';
import moment from 'moment';

class TimeUpdated extends React.Component {
  static propTypes = {
    timestamp: PropTypes.number
  };

  render() {
    const { timestamp } = this.props;
    let dateString = (timestamp)?moment(timestamp, 'x').format("YYYY-MM-DD HH:mm:ss"):'--';
    return (
      <span>{"Updated: "+dateString}</span>
    );
  }
}

export default TimeUpdated