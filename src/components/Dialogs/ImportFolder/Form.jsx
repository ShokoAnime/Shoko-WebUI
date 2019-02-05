// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  Button, Classes, ControlGroup, FormGroup, InputGroup, Switch,
} from '@blueprintjs/core';
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

  onChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
    const item = event.target;
    const { formData } = this.props;
    if (item.type === 'checkbox') {
      formData({ [item.id]: item.checked ? 1 : 0 });
    } else {
      formData({ [item.id]: item.value });
    }
  };

  onFolderSelect = (folder) => {
    const { formData } = this.props;
    formData({ ImportFolderLocation: folder });
  };

  handleBrowse = () => {
    const { browseStatus } = this.props;
    browseStatus(true);
  };

  render() {
    const { form } = this.props;
    const {
      ImportFolderName, ImportFolderLocation, IsDropSource,
      IsDropDestination, IsWatched,
    } = form;

    return (
      <React.Fragment>
        <FormGroup label="Name">
          <InputGroup
            id="ImportFolderName"
            value={ImportFolderName}
            placeholder="Enter friendly name"
            onChange={this.onChange}
          />
        </FormGroup>
        <FormGroup label="Location">
          <ControlGroup fill>
            <InputGroup
              id="ImportFolderLocation"
              value={ImportFolderLocation}
              placeholder="Enter folder location"
              onChange={this.onChange}
              readonly
            />
            <Button className={Classes.FIXED} onClick={this.handleBrowse}>Browse</Button>
          </ControlGroup>
        </FormGroup>
        <Switch id="IsDropSource" label="Drop source" onChange={this.onChange} checked={IsDropSource} />
        <Switch id="IsDropDestination" label="Drop destination" onChange={this.onChange} checked={IsDropDestination} />
        <Switch id="IsWatched" label="Watch folder" onChange={this.onChange} checked={IsWatched} />
        <BrowseFolderModal onSelect={this.onFolderSelect} />
      </React.Fragment>
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
