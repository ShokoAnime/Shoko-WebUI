import React, { PropTypes } from 'react';
import { Alert } from 'react-bootstrap';

class StatusPanel extends React.Component {
  static propTypes = {
    isFetching: PropTypes.bool,
    lastUpdated: PropTypes.number,
    code: PropTypes.number,
    message: PropTypes.string,
  };

  static defaultProps = {
    isFetching: false,
    code: 0,
    message: '',
  };

  render() {
    const { isFetching, code, message } = this.props;
    if (code === 0) { return null; }
    const panelMessage = isFetching ?
      [<i className="fa fa-refresh fa-spin" />, 'Sending...'] : message;
    return (
      <Alert bsStyle={code === 200 ? 'success' : 'danger'}>{panelMessage}</Alert>
    );
  }
}

export default StatusPanel;
