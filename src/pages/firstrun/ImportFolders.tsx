import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach, omit } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faFolderOpen, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { setSaved as setFirstRunSaved } from '../../core/slices/firstrun';
import Button from '../../components/Input/Button';
import InputSmall from '../../components/Input/InputSmall';
import Checkbox from '../../components/Input/Checkbox';
import Footer from './Footer';
import BrowseFolderModal from '../../components/Dialogs/BrowseFolderModal';
import { setStatus as setBrowseStatus } from '../../core/slices/modals/browseFolder';
import type { ImportFolderType } from '../../core/types/api/import-folder';
import SelectSmall from '../../components/Input/SelectSmall';
import TransitionDiv from '../../components/TransitionDiv';

type State = ImportFolderType &{
  showAddNew: boolean,
  showEdit: boolean,
};

const defaultState = {
  showAddNew: false,
  showEdit: false,
  WatchForNewFiles: false,
  DropFolderType: 0 as 0 | 1 | 2 | 3,
  Path: '',
  Name: '',
  ID: 0,
};

class ImportFolders extends React.Component<Props, State> {
  state = defaultState;

  handleInputChange = (event: any) => {
    const name = event.target.id;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    this.setState(prevState => Object.assign({}, prevState, { [name]: value }));
  };

  handleSave = () => {
    const { setSaved } = this.props;
    setSaved('import-folders');
  };

  handleAddFolder = () => {
    const { addImportFolder } = this.props;
    addImportFolder(omit(this.state, ['showAddNew', 'showEdit']));
    this.setState(defaultState);
  };

  handleAddNew = () => {
    const { showAddNew } = this.state;
    this.setState({
      showAddNew: !showAddNew,
    });
  };

  handleCancel = () => {
    this.setState(defaultState);
  };

  handleEdit = (folder: ImportFolderType) => {
    this.setState({
      showAddNew: true,
      showEdit: true,
      Name: folder.Name,
      WatchForNewFiles: folder.WatchForNewFiles,
      DropFolderType: folder.DropFolderType,
      Path: folder.Path,
      ID: folder.ID,
    });
  };

  handleEditFolder = () => {
    const { editImportFolder } = this.props;
    editImportFolder(this.state);
    this.setState(defaultState);
  };

  renderFolder = (folder: ImportFolderType) => {
    const { deleteImportFolder } = this.props;
    let flags = '';

    switch (folder.DropFolderType) {
      case 1:
        flags = 'Drop Source';
        break;
      case 2:
        flags = 'Drop Destination';
        break;
      case 3:
        flags = 'Both Drop Source and Destination';
        break;
      default:
    }
    if (folder.WatchForNewFiles) {
      flags += folder.DropFolderType ? ', Watch For New Files' : 'Watch For New Files';
    }

    return (
      <div className="flex font-mulish items-center w-full my-2">
        <Button onClick={() => this.handleEdit(folder)} className="flex mr-2 color-highlight-1">
          <FontAwesomeIcon icon={faEdit} />
        </Button>
        <Button onClick={() => deleteImportFolder(folder.ID!)} className="flex mr-4 color-highlight-1">
          <FontAwesomeIcon icon={faTrashAlt} />
        </Button>
        <div className="flex flex-col">
          <div className="flex">
            <span className="flex font-semibold mr-1">{`${folder.Name} -`}</span>
            <span className="flex">{folder.Path}</span>
          </div>
          <span className="flex">{flags}</span>
        </div>
      </div>
    );
  };

  renderForm = () => {
    const {
      Name, WatchForNewFiles, DropFolderType, Path, showEdit,
    } = this.state;
    return (
      <div className="flex flex-col mt-4 w-3/5">
        <div className="flex justify-between items-center font-mulish">
          Name
          <InputSmall id="Name" value={Name} type="text" placeholder="Name" onChange={this.handleInputChange} className="my-1 w-80 p-2" />
        </div>
        <div className="flex justify-between items-center font-mulish">
          Path
          <div className="flex">
            <InputSmall id="Path" value={Path} type="text" placeholder="Path" onChange={this.handleInputChange} className="my-1 w-72 p-2" />
            <Button onClick={this.handleBrowse} className="color-highlight-1 ml-2 text-lg">
              <FontAwesomeIcon icon={faFolderOpen} className="align-middle" />
            </Button>
          </div>
        </div>
        <div className="flex font-bold mt-2">Type</div>
        <Checkbox label="Watch For New Files" id="WatchForNewFiles" isChecked={WatchForNewFiles} onChange={this.handleInputChange} className="mt-2 mb-1" />
        <SelectSmall label="Drop Type" id="DropFolderType" value={DropFolderType} onChange={this.handleInputChange} className="my-1">
          <option value={0}>None</option>
          <option value={1}>Source</option>
          <option value={2}>Destination</option>
          <option value={3}>Both</option>
        </SelectSmall>
        <span className="flex mt-6">
          {showEdit ? (
            <Button onClick={() => this.handleEditFolder()} className="bg-color-highlight-1 py-2 px-3 rounded text-sm">
              Edit Import Folder
            </Button>
          ) : (
            <Button onClick={() => this.handleAddFolder()} className="bg-color-highlight-1 py-2 px-3 rounded text-sm" disabled={Name === '' || Path === ''}>
              Add Import Folder
            </Button>
          )}
          <Button onClick={() => this.handleCancel()} className="bg-color-highlight-1 py-2 px-3 rounded text-sm ml-2">
            Cancel
          </Button>
        </span>
      </div>
    );
  };

  handleBrowse = () => {
    const { browseStatus } = this.props;
    browseStatus(true);
  };

  onFolderSelect = (folder: string) => {
    this.setState(prevState => Object.assign({}, prevState, { Path: folder }));
  };

  render() {
    const { importFolders } = this.props;
    const { showAddNew } = this.state;

    const items: Array<any> = [];

    forEach(importFolders, (folder: ImportFolderType) => {
      items.push(this.renderFolder(folder));
    });

    return (
      <React.Fragment>
        <TransitionDiv className="flex flex-col flex-grow justify-center overflow-y-auto" enterFrom="opacity-0">
          <div className="font-bold text-lg">Import Folders</div>
          <div className="font-mulish mt-5 text-justify">
            Shoko requires at least <span className="font-bold">one</span> import folder in order to work properly, however you can
            have as many import folders as you&apos;d like. Please note you can only have <span className="font-bold">one</span> folder
            designated as your drop destination.
          </div>
          <div className="flex flex-col my-8 overflow-y-auto">
            <div className="font-bold">Current Import Folders</div>
            <div className="flex flex-col">{items}</div>
            <div className="flex mt-2">
              <Button onClick={() => this.handleAddNew()} className="bg-color-highlight-1 py-1 px-2 text-sm">Add New</Button>
            </div>
            {showAddNew && this.renderForm()}
          </div>
          <Footer nextPage="data-collection" saveFunction={this.handleSave} />
        </TransitionDiv>
        <BrowseFolderModal onSelect={this.onFolderSelect} />
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  importFolders: state.mainpage.importFolders,
});

const mapDispatch = {
  browseStatus: (value: boolean) => (setBrowseStatus(value)),
  addImportFolder: (payload: ImportFolderType) => ({ type: Events.IMPORT_FOLDER_ADD, payload }),
  editImportFolder: (payload: ImportFolderType) => ({ type: Events.IMPORT_FOLDER_EDIT, payload }),
  deleteImportFolder: (payload: number) => ({ type: Events.IMPORT_FOLDER_DELETE, payload }),
  setSaved: (value: string) => (setFirstRunSaved(value)),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(ImportFolders);
