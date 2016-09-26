import React, { PropTypes } from 'react';
import { Panel } from 'react-bootstrap';

class StatusPanel extends React.Component {
  static propTypes = {
    isFetching: PropTypes.bool,
    lastUpdated: PropTypes.number,
    items: PropTypes.object,
  };

  render() {
    const { lastUpdated, isFetching, items } = this.props;
    const { status, message } = items;
    if (!lastUpdated) { return null; }
    const panelMessage = isFetching ?
      [<i className="fa fa-refresh fa-spin" />, 'Sending...'] : message;
    return (
      <Panel
        header={status ? 'Success' : 'Error'}
        bsStyle={status ? 'info' : 'danger'}
      >{panelMessage}</Panel>
    );
  }
}

export default StatusPanel;
