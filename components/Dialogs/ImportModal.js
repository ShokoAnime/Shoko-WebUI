import React, { PropTypes } from 'react';
import {
  Modal,
  Tabs,
  Tab,
  Panel,
  Col,
  FormControl,
  ControlLabel,
  Button,
  Form,
  FormGroup,
  Checkbox,
  InputGroup,
  ButtonToolbar,
} from 'react-bootstrap';
import s from './ImportModal.css';
import { setModalsStatus } from '../../core/actions';
import store from '../../core/store';

class ImportModal extends React.Component {
  static propTypes = {
    show: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleSelect() {
  }

  handleClose() {
    store.dispatch(setModalsStatus({ importFolders: false }));
  }

  render() {
    const { show } = this.props;
    return (
      <Modal show={show} className={s.modal}>
        <Panel header="Manage import folders">
          <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
            <Tab eventKey={1} title="Add new">
              <Panel header="Info Box Example" bsStyle="info">Info message</Panel>
              <Panel>
                <Form horizontal>
                  <FormGroup controlId="location">
                    <Col componentClass={ControlLabel} sm={2}>
                      Location
                    </Col>
                    <Col sm={10}>
                      <InputGroup>
                        <FormControl type="text" placeholder="Enter folder location" />
                        <InputGroup.Button>
                          <Button>Browse</Button>
                        </InputGroup.Button>
                      </InputGroup>
                    </Col>
                  </FormGroup>
                  <FormGroup>
                    <Col smOffset={2} sm={10}>
                      <Checkbox>Drop source</Checkbox>
                    </Col>
                    <Col smOffset={2} sm={10}>
                      <Checkbox>Drop destination</Checkbox>
                    </Col>
                    <Col smOffset={2} sm={10}>
                      <Checkbox>Watch folder</Checkbox>
                    </Col>
                  </FormGroup>
                </Form>
                <ButtonToolbar className="pull-right">
                  <Button bsStyle="primary">Add</Button>
                  <Button onClick={this.handleClose}>Cancel</Button>
                </ButtonToolbar>
              </Panel>
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
