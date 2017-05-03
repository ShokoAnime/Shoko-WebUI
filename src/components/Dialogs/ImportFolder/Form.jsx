import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import {
  Col,
  FormControl,
  ControlLabel,
  Button,
  Form,
  FormGroup,
  Checkbox,
  InputGroup,
} from 'react-bootstrap';
import BrowseFolderModal from '../BrowseFolderModal';
import { setStatus as setBrowseStatus } from '../../../core/actions/modals/BrowseFolder';
import { setFormData } from '../../../core/actions/modals/ImportFolder';
import store from '../../../core/store';

class AddTab extends React.Component {
  static propTypes = {
    form: PropTypes.object,
    showBrowse: PropTypes.bool,
  };

  static onChange(event) {
    const item = event.target;
    if (item.type === 'checkbox') {
      store.dispatch(setFormData({ [item.id]: item.checked ? 1 : 0 }));
    } else {
      store.dispatch(setFormData({ [item.id]: item.value }));
    }
  }

  static onFolderSelect(folder) {
    store.dispatch(setFormData({ ImportFolderLocation: folder }));
  }

  static handleBrowse() {
    store.dispatch(setBrowseStatus(true));
  }

  render() {
    const { form, showBrowse } = this.props;
    const { ImportFolderName, ImportFolderLocation, IsDropSource,
      IsDropDestination, IsWatched } = form;

    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>Name</Col>
          <Col sm={10}>
            <FormControl
              type="text"
              id="ImportFolderName"
              value={ImportFolderName}
              placeholder="Enter friendly name"
              onChange={AddTab.onChange}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>Location</Col>
          <Col sm={10}>
            <InputGroup>
              <FormControl
                type="text"
                id="ImportFolderLocation"
                value={ImportFolderLocation}
                placeholder="Enter folder location"
                readOnly
              />
              <InputGroup.Button>
                <Button onClick={AddTab.handleBrowse}>Browse</Button>
              </InputGroup.Button>
            </InputGroup>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col smOffset={2} sm={10}>
            <Checkbox
              id="IsDropSource"
              onChange={AddTab.onChange}
              checked={IsDropSource}
            >Drop source</Checkbox>
          </Col>
          <Col smOffset={2} sm={10}>
            <Checkbox
              id="IsDropDestination"
              onChange={AddTab.onChange}
              checked={IsDropDestination}
            >Drop destination</Checkbox>
          </Col>
          <Col smOffset={2} sm={10}>
            <Checkbox
              id="IsWatched"
              onChange={AddTab.onChange}
              checked={IsWatched}
            >Watch folder</Checkbox>
          </Col>
        </FormGroup>
        <BrowseFolderModal show={showBrowse} onSelect={AddTab.onFolderSelect} />
      </Form>
    );
  }
}

function mapStateToProps(state) {
  const { modals } = state;
  const { form } = modals.importFolder;

  return {
    form,
    showBrowse: modals.browseFolder.status,
  };
}

export default connect(mapStateToProps)(AddTab);
