import React, { PropTypes } from 'react';
import { Modal, Tabs, Tab, Panel, FormGroup, FormControl, HelpBlock, ControlLabel } from 'react-bootstrap';

class ImportModal extends React.Component {
  static propTypes = {
    show: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect() {}

  render() {
    const { show } = this.props;
    return (
      <Modal show={show}>
        <Panel>
          <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
            <Tab eventKey={1} title="Add new">
              <Panel header="Info Box Example">Info message</Panel>
              <form>
                <FormGroup controlId="text-field">
                  <ControlLabel>Text</ControlLabel>
                  <FormControl type="text" placeholder="Enter text" />
                  <HelpBlock>Additional tips</HelpBlock>
                </FormGroup>
              </form>
            </Tab>
            <Tab eventKey={2} title="Edit / Delete">Tab 2 content</Tab>
            <Tab eventKey={3} title="Providers" disabled>Tab 3 content</Tab>
          </Tabs>
        </Panel>
      </Modal>
    );
  }
}

export default ImportModal;
