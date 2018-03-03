// @flow
import PropTypes from 'prop-types';
import React from 'react';
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

export type FormType = {
  ImportFolderName?: string,
  ImportFolderLocation?: string,
  IsDropSource?: number,
  IsDropDestination?: number,
  IsWatched?: number
}

type Props = {
  form: FormType,
  formData: (FormType) => void,
  browseStatus: (boolean) => void,
}

class AddTab extends React.Component<Props> {
  static propTypes = {
    form: PropTypes.object,
    formData: PropTypes.func.isRequired,
    browseStatus: PropTypes.func.isRequired,
  };

  onChange = (event) => {
    const item = event.target;
    if (item.type === 'checkbox') {
      this.props.formData({ [item.id]: item.checked ? 1 : 0 });
    } else {
      this.props.formData({ [item.id]: item.value });
    }
  };

  onFolderSelect = (folder) => {
    this.props.formData({ ImportFolderLocation: folder });
  };

  handleBrowse = () => {
    this.props.browseStatus(true);
  };

  render() {
    const { form } = this.props;
    const {
      ImportFolderName, ImportFolderLocation, IsDropSource,
      IsDropDestination, IsWatched,
    } = form;

    return (
      <Form horizontal>
        <FormGroup>
          <Col sm={2}>
            <ControlLabel>Name</ControlLabel>
          </Col>
          <Col sm={10}>
            <FormControl
              type="text"
              id="ImportFolderName"
              value={ImportFolderName}
              placeholder="Enter friendly name"
              onChange={this.onChange}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={2}>
            <ControlLabel>Location</ControlLabel>
          </Col>
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
                <Button onClick={this.handleBrowse}>Browse</Button>
              </InputGroup.Button>
            </InputGroup>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col smOffset={2} sm={10}>
            <Checkbox
              id="IsDropSource"
              onChange={this.onChange}
              checked={IsDropSource}
            >Drop source
            </Checkbox>
          </Col>
          <Col smOffset={2} sm={10}>
            <Checkbox
              id="IsDropDestination"
              onChange={this.onChange}
              checked={IsDropDestination}
            >Drop destination
            </Checkbox>
          </Col>
          <Col smOffset={2} sm={10}>
            <Checkbox
              id="IsWatched"
              onChange={this.onChange}
              checked={IsWatched}
            >Watch folder
            </Checkbox>
          </Col>
        </FormGroup>
        <BrowseFolderModal onSelect={this.onFolderSelect} />
      </Form>
    );
  }
}

function mapStateToProps(state) {
  const { modals } = state;
  const { form } = modals.importFolder;

  return {
    form,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    formData: value => dispatch(setFormData(value)),
    browseStatus: value => dispatch(setBrowseStatus(value)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddTab);
