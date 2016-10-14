import React, { PropTypes } from 'react';
import { Alert } from 'react-bootstrap';

class StatusPanel extends React.Component {
  static propTypes = {
    isFetching: PropTypes.bool,
    lastUpdated: PropTypes.number,
    items: PropTypes.object,
  };

  render() {
    const { lastUpdated, isFetching, items } = this.props;
    const { code, message } = items;
    if (!lastUpdated) { return null; }
    const panelMessage = isFetching ?
      [<i className="fa fa-refresh fa-spin" />, 'Sending...'] : message;
    return (
      <Alert bsStyle={code === 200 ? 'success' : 'danger'}>{panelMessage}</Alert>
    );
  }
}

export default StatusPanel;
