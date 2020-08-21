import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faTimes } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import Button from '../Buttons/Button';
import Input from '../Input/Input';
import Checkbox from '../Input/Checkbox';
import Select from '../Input/Select';
import ModalPanel from '../Panels/ModalPanel';
import BrowseFolderModal from './BrowseFolderModal';
import { setStatus } from '../../core/slices/modals/importFolder';
import { setStatus as setBrowseStatus } from '../../core/slices/modals/browseFolder';
import type { ImportFolderType } from '../../core/types/api/import-folder';

type State = ImportFolderType;

const defaultState = {
  WatchForNewFiles: false,
  DropFolderType: 0 as 0 | 1 | 2 | 3,
  Path: '',
  Name: '',
  ID: 0,
};

class ImportFolderModal extends React.Component<Props, State> {
  state = defaultState;

  getFolderDetails = () => {
    const { edit, ID, importFolders } = this.props;
    this.setState(defaultState);
    if (edit) {
      this.setState(importFolders[ID - 1]);
    }
  };

  handleInputChange = (event: any) => {
    const name = event.target.id;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    this.setState(prevState => Object.assign({}, prevState, { [name]: value }));
  };

  handleBrowse = () => {
    const { browseStatus } = this.props;
    browseStatus(true);
  };

  handleClose = () => {
    const { status } = this.props;
    status(false);
  };

  handleDelete = () => {
    const { ID } = this.props;
    const { deleteImportFolder } = this.props;
    deleteImportFolder(ID!);
    this.handleClose();
  };

  handleSave = () => {
    const { edit, addImportFolder, editImportFolder } = this.props;
    if (edit) {
      editImportFolder(this.state);
    } else {
      addImportFolder(this.state);
    }
    this.handleClose();
  };

  onFolderSelect = (folder: string) => {
    this.setState({ Path: folder });
  };

  render() {
    const {
      Name, WatchForNewFiles, DropFolderType, Path,
    } = this.state;
    const { edit, show } = this.props;

    return (
      <React.Fragment>
        <ModalPanel
          show={show}
          className="import-folder-modal px-6 pt-3 pb-6"
          onRequestClose={() => this.handleClose()}
          onAfterOpen={() => this.getFolderDetails()}
        >
          <div className="flex flex-col w-full">
            <div className="flex justify-between">
              <span className="flex font-semibold text-xl2 uppercase fixed-panel-header">
                {edit ? 'Edit Import Folder' : 'Add New Import Folder'}
              </span>
              <span className="flex">
                <Button onClick={() => this.handleClose()}>
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
              </span>
            </div>
            <div className="bg-color-accent-secondary my-2 h-1 w-10 flex-shrink-0" />
            <div className="flex flex-col flex-grow w-3/5">
              <Input id="Name" value={Name} label="Name" type="text" placeholder="Name" onChange={this.handleInputChange} className="my-1 w-full" />
              <div className="flex items-end">
                <Input id="Path" value={Path} label="Location" type="text" placeholder="Location" onChange={this.handleInputChange} className="my-1 w-full" />
                <Button onClick={this.handleBrowse} className="color-accent ml-2 mb-2 text-lg">
                  <FontAwesomeIcon icon={faFolderOpen} />
                </Button>
              </div>
              <span className="flex font-bold mt-2">Type</span>
              <Checkbox label="Watch For New Files" id="WatchForNewFiles" isChecked={WatchForNewFiles} onChange={this.handleInputChange} />
              <div className="flex item-center justify-between">
                Drop Type
                <Select id="DropFolderType" value={DropFolderType} onChange={this.handleInputChange}>
                  <option value={0}>None</option>
                  <option value={1}>Source</option>
                  <option value={2}>Destination</option>
                  <option value={3}>Both</option>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              {edit && (
                <Button onClick={this.handleDelete} className="bg-color-danger px-5 py-2 mr-2">Delete</Button>
              )}
              <Button onClick={this.handleSave} className="bg-color-accent px-5 py-2">Save</Button>
            </div>
          </div>
        </ModalPanel>
        <BrowseFolderModal onSelect={this.onFolderSelect} />
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  show: state.modals.importFolder.status,
  importFolders: state.mainpage.importFolders,
  edit: state.modals.importFolder.edit,
  ID: state.modals.importFolder.ID,
});

const mapDispatch = {
  browseStatus: (value: boolean) => (setBrowseStatus(value)),
  addImportFolder: (payload: ImportFolderType) => ({ type: Events.IMPORT_FOLDER_ADD, payload }),
  editImportFolder: (payload: ImportFolderType) => ({ type: Events.IMPORT_FOLDER_EDIT, payload }),
  deleteImportFolder: (payload: number) => ({ type: Events.IMPORT_FOLDER_DELETE, payload }),
  status: (value: boolean) => (setStatus(value)),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(ImportFolderModal);
