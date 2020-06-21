import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faFolderOpen } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../core/store';
import { activeTab as activeTabAction } from '../../core/actions/firstrun';
import Button from '../../components/Buttons/Button';
import Input from '../../components/Input/Input';
import Checkbox from '../../components/Input/Checkbox';
import Footer from './Footer';
import BrowseFolderModal from '../../components/Dialogs/BrowseFolderModal';
import { setStatus as setBrowseStatus } from '../../core/slices/modals/browseFolder';
import { setFormData } from '../../core/actions/settings/ImportFolder';
import type { ImportFolderType } from '../../core/types/api/import-folder';

type State = {
  showAddNew: boolean,
  importFolderPath: string,
  watchForNewFiles: boolean,
  dropSource: boolean,
  dropDestination: boolean,
};

class ImportFolders extends React.Component<Props, State> {
  state = {
    showAddNew: false,
    importFolderPath: '',
    watchForNewFiles: false,
    dropSource: false,
    dropDestination: false,
  };

  handleInputChange = (event: any) => {
    const name = event.target.id;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    this.setState(prevState => Object.assign(prevState, { [name]: value }));
  };

  handleAddNew = () => {
    this.setState({
      showAddNew: true,
    });
  };

  renderFolder = (folder: ImportFolderType) => {
    let flags = '';

    if (folder.DropFolderType === 1) flags = 'Drop Source'; else if (folder.DropFolderType === 2) flags = 'Drop Destination';

    if (folder.WatchForNewFiles) {
      flags += folder.DropFolderType ? ', Watch For New Files' : 'Watch For New Files';
    }

    return (
      <div className="flex font-muli">
        <Button onClick={() => ({})} className="flex mr-6">
          <FontAwesomeIcon icon={faEdit} />
        </Button>
        <span className="flex font-bold">{flags}</span>
      </div>
    );
  };

  renderAddNew = () => {
    const {
      importFolderPath, watchForNewFiles, dropSource, dropDestination,
    } = this.state;
    return (
      <div className="flex flex-col">
        <div className="flex items-end">
          <span className="w-2/3">
            <Input id="importFolderPath" value={importFolderPath} label="Location" type="text" placeholder="Location" onChange={this.handleInputChange} className="py-2" />
          </span>
          <Button onClick={this.handleBrowse} className="color-accent ml-2 mb-2 text-lg">
            <FontAwesomeIcon icon={faFolderOpen} />
          </Button>
        </div>
        <span className="flex font-bold mt-7">Type</span>
        <div className="flex items-center">
          <span className="w-1/2">Watch For New Files</span>
          <Checkbox id="watchForNewFiles" isChecked={watchForNewFiles} onChange={this.handleInputChange} />
        </div>
        <div className="flex items-center">
          <span className="w-1/2">Drop Source</span>
          <Checkbox id="dropSource" isChecked={dropSource} onChange={this.handleInputChange} />
        </div>
        <div className="flex items-center">
          <span className="w-1/2">Drop Destination</span>
          <Checkbox id="dropDestination" isChecked={dropDestination} onChange={this.handleInputChange} />
        </div>
        <span className="flex mt-8">
          <Button onClick={() => ({})} className="bg-color-accent  py-2 px-3 rounded">
            Add Import Folder
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
    this.setState(prevState => Object.assign(prevState, { importFolderPath: folder }));
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
        <div className="flex flex-col flex-grow p-10">
          <div className="font-bold text-lg">Import Folders</div>
          <div className="font-muli mt-5">
            Shoko requires at least <span className="font-bold">one</span> import folder in order to work properly, however you can
            have as many import folders as you&apos;d like. Please note you can only have <span className="font-bold">one</span> folder
            designated as your drop destination.
          </div>
          <div className="font-bold mt-5">Current Import Folders</div>
          <div className="flex">{items}</div>
          <div className="flex">
            <Button onClick={() => this.handleAddNew()} className="bg-color-accent  py-2 px-3 rounded">Add New</Button>
          </div>
          {showAddNew && this.renderAddNew()}
        </div>
        <Footer prevTabKey="tab-community-sites" nextTabKey="tab-data-collection" />
        <BrowseFolderModal onSelect={this.onFolderSelect} />
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  importFolders: state.mainpage.importFolders,
  form: state.settings.importFolder,
});

const mapDispatch = {
  setActiveTab: (value: string) => (activeTabAction(value)),
  browseStatus: (value: boolean) => (setBrowseStatus(value)),
  setFormData: (value: ImportFolderType) => (setFormData(value)),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(ImportFolders);
