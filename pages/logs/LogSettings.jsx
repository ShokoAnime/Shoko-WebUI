import React from 'react';
import { Panel, Checkbox } from 'react-bootstrap';

class LogSettings extends React.Component {

  render() {
    return (
      <Panel>
        <Checkbox>Errors</Checkbox>
        <Checkbox>Warnings</Checkbox>
      </Panel>
    );
  }
}

export default LogSettings;
