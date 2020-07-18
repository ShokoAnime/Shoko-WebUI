import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import { forEach } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSquare, faEdit, faServer, faSearch, faCircleNotch, faPlus,
} from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Buttons/Button';
import { setEdit, setStatus } from '../../../core/slices/modals/importFolder';

type ImportFolderType = {
  ID: number;
  WatchForNewFiles?: boolean;
  DropFolderType?: number;
  Path: string;
  FileSize?: number;
  Name: string;
  Size?: number;
};

class ImportFolders extends React.Component<Props> {
  renderFolder = (folder: ImportFolderType) => {
    const { rescanFolder, openImportFolderModalEdit } = this.props;

    let flags = '';
    if (folder.DropFolderType === 1) flags = 'Drop Source'; else if (folder.DropFolderType === 2) flags = 'Drop Destination';
    if (folder.WatchForNewFiles) flags += folder.DropFolderType ? ', Watch For New Files' : 'Watch For New Files';

    return (
      <div key={folder.ID} className="flex flex-col mt-3">
        <div className="flex justify-between">
          <span className="font-semibold">{folder.Name}</span>
          <span className="color-accent">Online</span>
        </div>
        <div className="flex justify-between mt-1">
          <div className="flex mr-1">{folder.Path}</div>
          <div className="flex color-accent items-start">
            <Button className="color-accent mr-3" onClick={() => rescanFolder(folder.ID)} tooltip="Rescan Folder">
              <span className="fa-layers fa-fw">
                <FontAwesomeIcon icon={faServer} />
                <FontAwesomeIcon icon={faSquare} transform="shrink-5 down-2 right-6" className="fa-layer-icon-bg" />
                <FontAwesomeIcon icon={faSearch} transform="shrink-6 down-2.75 right-6" />
              </span>
            </Button>
            <Button className="color-accent" onClick={() => openImportFolderModalEdit(folder.ID)} tooltip="Edit Folder">
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          </div>
        </div>
        {flags !== '' && (<div className="mt-1">{flags}</div>)}
        <div className="mt-1">
          Series: {folder.Size ?? 0} / Size: {prettyBytes(folder.FileSize ?? 0)}
        </div>
      </div>

    );
  };

  renderOptions = () => {
    const { setImportFolderModalStatus } = this.props;

    return (
      <div>
        <Button className="color-accent mx-2" onClick={() => setImportFolderModalStatus(true)} tooltip="Add Folder">
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </div>
    );
  };

  render() {
    const { importFolders, hasFetched } = this.props;

    const folders: Array<any> = [];

    forEach(importFolders, (folder: ImportFolderType) => {
      folders.push(this.renderFolder(folder));
    });

    if (folders.length === 0) {
      folders.push(<div className="flex justify-center font-bold mt-4" key="no-folders">No import folders added!</div>);
    }

    return (
      <FixedPanel title="Import Folders" options={this.renderOptions()}>
        {!hasFetched ? (
          <div className="flex justify-center items-center h-full">
            <FontAwesomeIcon icon={faCircleNotch} spin className="text-6xl color-accent-secondary" />
          </div>
        ) : folders}
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  importFolders: state.mainpage.importFolders,
  hasFetched: state.mainpage.fetched.importFolders,
});

const mapDispatch = {
  setImportFolderModalStatus: (payload: boolean) => (setStatus(payload)),
  openImportFolderModalEdit: (ID: number) => (setEdit(ID)),
  rescanFolder: (payload: number) => ({ type: Events.IMPORT_FOLDER_RESCAN, payload }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(ImportFolders);
