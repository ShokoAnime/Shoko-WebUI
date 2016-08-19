import React, { PropTypes } from 'react';
import { Panel } from 'react-bootstrap';

class StatusPanel extends React.Component {
  static propTypes = {
    lastUpdated: PropTypes.number,
    StatusCode: PropTypes.number,
    Message: PropTypes.string,
    items: PropTypes.object,
  };

  render() {
    const { lastUpdated, items } = this.props;
    const { Details, StatusCode, Message } = items;
    if (!lastUpdated) { return null; }
    return (
      <Panel
        header={StatusCode === 200 ? 'Success' : 'Error'}
        bsStyle={StatusCode === 200 ? 'info' : 'danger'}
      >{Message}{Details}</Panel>
    );
  }
}

export default StatusPanel;
