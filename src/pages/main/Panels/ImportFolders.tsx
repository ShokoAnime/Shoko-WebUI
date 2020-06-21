import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import { forEach } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSquare, faEdit, faServer, faSearch, faCircleNotch,
} from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Buttons/Button';

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
  renderType = (ID: number, dropFolderType = 0, watchForNewFiles = false) => {
    let flags = '';

    if (dropFolderType === 1) flags = 'Drop Source'; else if (dropFolderType === 2) flags = 'Drop Destination';

    if (watchForNewFiles) {
      flags += dropFolderType ? ', Watch For New Files' : 'Watch For New Files';
    }

    return (
      <div key={`${ID}-type`} className="flex font-semibold my-2">
        <span className="flex-grow">{flags}</span>
        <span className="color-accent">Online</span>
      </div>
    );
  };

  renderPath = (ID: number, Path: string) => {
    const { rescanFolder } = this.props;
    return (
      <div key={`${ID}-path`} className="flex mb-2">
        <span className="flex flex-grow mr-1">{Path}</span>
        <div className="flex color-accent items-start">
          <Button className="color-accent mr-3" onClick={() => rescanFolder!(ID)}>
            <span className="fa-layers fa-fw">
              <FontAwesomeIcon icon={faServer} />
              <FontAwesomeIcon icon={faSquare} transform="shrink-5 down-2 right-6" className="fa-layer-icon-bg" />
              <FontAwesomeIcon icon={faSearch} transform="shrink-6 down-2.75 right-6" />
            </span>
          </Button>
          <Button className="color-accent" onClick={() => { }}>
            <FontAwesomeIcon icon={faEdit} />
          </Button>
        </div>
      </div>
    );
  };

  renderSize = (ID: number, FileSize = 0, Size = 0) => (
    <span key={`${ID}-size`} className="mb-2">
      Series: {Size} / Size: {prettyBytes(FileSize)}
    </span>
  );

  render() {
    const { importFolders, hasFetched } = this.props;

    const folders: Array<any> = [];

    forEach(importFolders, (folder: ImportFolderType) => {
      folders.push(this.renderType(folder.ID, folder.DropFolderType, folder.WatchForNewFiles));
      folders.push(this.renderPath(folder.ID, folder.Path));
      folders.push(this.renderSize(folder.ID, folder.FileSize, folder.Size));
    });

    return (
      <FixedPanel title="Import Folders">
        {!hasFetched ? (
          <div className="flex justify-center items-center h-full">
            <FontAwesomeIcon icon={faCircleNotch} spin className="text-6xl color-accent-secondary" />
          </div>
        ) : (folders)}
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  importFolders: state.mainpage.importFolders,
  hasFetched: state.mainpage.fetched.importFolders,
});

const mapDispatch = {
  rescanFolder: (payload: number) => ({ type: Events.IMPORT_FOLDER_RESCAN, payload }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(ImportFolders);
