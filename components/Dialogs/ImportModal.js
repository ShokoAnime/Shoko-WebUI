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
import StatusPanel from '../../components/Panels/StatusPanel';
import s from './ImportModal.css';
import { setStatus as setBrowseStatus } from '../../core/actions/modals/BrowseFolder';
import { setStatus as setImportStatus,
  addFolderAsync } from '../../core/actions/modals/ImportFolder';
import store from '../../core/store';

class ImportModal extends React.Component {
  static propTypes = {
    status: PropTypes.bool,
    folder: PropTypes.string,
    isFetching: PropTypes.bool,
    addFolder: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.handleBrowse = this.handleBrowse.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleBrowse() {
    store.dispatch(setBrowseStatus(true));
  }

  handleClose() {
    store.dispatch(setImportStatus(false));
  }

  handleSubmit() {
    const data = {
      ImportFolderType: '1',
      ImportFolderName: '',
      ImportFolderLocation: this.formFolder.props.value,
      IsDropSource: this.formDropSource.checked ? 1 : 0,
      IsDropDestination: this.formDropDestination.checked ? 1 : 0,
      IsWatched: this.formWatched.checked ? 1 : 0,
    };

    addFolderAsync(data);
  }

  render() {
    const { status, folder, addFolder } = this.props;
    const { isFetching } = addFolder;
    return (
      <Modal show={status} className={s.modal}>
        <Panel header="Manage import folders">
          <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
            <Tab eventKey={1} title="Add new">
              <StatusPanel {...addFolder} />
              <Panel>
                <Form horizontal>
                  <FormGroup controlId="location">
                    <Col componentClass={ControlLabel} sm={2}>
                      Location
                    </Col>
                    <Col sm={10}>
                      <InputGroup>
                        <FormControl
                          type="text"
                          value={folder}
                          placeholder="Enter folder location"
                          readOnly
                          ref={(c) => { this.formFolder = c; return null; }}
                        />
                        <InputGroup.Button>
                          <Button onClick={this.handleBrowse}>Browse</Button>
                        </InputGroup.Button>
                      </InputGroup>
                    </Col>
                  </FormGroup>
                  <FormGroup>
                    <Col smOffset={2} sm={10}>
                      <Checkbox
                        ref={(c) => { this.formDropSource = c; return null; }}
                      >Drop source</Checkbox>
                    </Col>
                    <Col smOffset={2} sm={10}>
                      <Checkbox
                        ref={(c) => { this.formDropDestination = c; return null; }}
                      >Drop destination</Checkbox>
                    </Col>
                    <Col smOffset={2} sm={10}>
                      <Checkbox
                        ref={(c) => { this.formWatched = c; return null; }}
                      >Watch folder</Checkbox>
                    </Col>
                  </FormGroup>
                </Form>
                <ButtonToolbar className="pull-right">
                  <Button onClick={this.handleSubmit} bsStyle="primary">
                    {isFetching ? [<i className="fa fa-refresh fa-spin" />, 'Sending...'] : 'Add'}
                  </Button>
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
