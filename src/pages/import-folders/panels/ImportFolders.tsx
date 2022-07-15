import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSquare, faEdit, faServer, faSearch, faPlus,
} from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Input/Button';
import { setEdit, setStatus } from '../../../core/slices/modals/importFolder';

import type { ImportFolderType } from '../../../core/types/api/import-folder';

function ImportFolders() {
  const dispatch = useDispatch();

  const hasFetched = useSelector((state: RootState) => state.mainpage.fetched.importFolders);
  const importFolders = useSelector((state: RootState) => state.mainpage.importFolders);

  const rescanFolder = (ID: number) => dispatch({ type: Events.IMPORT_FOLDER_RESCAN, payload: ID });
  const setImportFolderModalStatus = (status: boolean) => dispatch(setStatus(status));
  const openImportFolderModalEdit = (ID: number) => dispatch(setEdit(ID));

  const renderFolder = (folder: ImportFolderType) => {
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
    if (folder.WatchForNewFiles) flags += folder.DropFolderType ? ', Watch For New Files' : 'Watch For New Files';

    return (
      <div key={folder.ID} className="flex flex-col mt-3 first:mt-0">
        <div className="flex justify-between">
          <span className="font-semibold">{folder.Name}</span>
          <span className="color-highlight-1">Online</span>
        </div>
        <div className="flex justify-between mt-1">
          <div className="flex mr-1">{folder.Path}</div>
          <div className="flex color-highlight-1 items-start">
            <Button className="color-highlight-1 mr-3" onClick={() => rescanFolder(folder.ID)} tooltip="Rescan Folder">
              <span className="fa-layers fa-fw">
                <FontAwesomeIcon icon={faServer} />
                <FontAwesomeIcon icon={faSquare} transform="shrink-5 down-2 right-6" className="fa-layer-icon-bg" />
                <FontAwesomeIcon icon={faSearch} transform="shrink-6 down-2.75 right-6" />
              </span>
            </Button>
            <Button className="color-highlight-1" onClick={() => openImportFolderModalEdit(folder.ID)} tooltip="Edit Folder">
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          </div>
        </div>
        {flags !== '' && (<div className="mt-1">{flags}</div>)}
        <div className="mt-1">
          Series: {folder.Size ?? 0} / Size: {prettyBytes(folder.FileSize ?? 0, { binary: true })}
        </div>
      </div>

    );
  };

  const renderOptions = () => (
    <div>
      <Button className="color-highlight-1 mx-2" onClick={() => setImportFolderModalStatus(true)} tooltip="Add Folder">
        <FontAwesomeIcon icon={faPlus} />
      </Button>
    </div>
  );

  return (
    <FixedPanel title="Import Folders" options={renderOptions()} isFetching={!hasFetched}>
      return {importFolders.length === 0
      ? (<div className="flex justify-center font-semibold mt-4" key="no-folders">No import folders added!</div>)
      : importFolders.map(importFolder => renderFolder(importFolder))}
    </FixedPanel>
  );
}

export default ImportFolders;
