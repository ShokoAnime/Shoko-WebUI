import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { find } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faTimes } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import Button from '../Input/Button';
import Input from '../Input/Input';
import Checkbox from '../Input/Checkbox';
import Select from '../Input/Select';
import ModalPanel from '../Panels/ModalPanel';
import BrowseFolderModal from './BrowseFolderModal';
import { setStatus } from '../../core/slices/modals/importFolder';
import { setStatus as setBrowseStatus } from '../../core/slices/modals/browseFolder';

const defaultImportFolder = {
  WatchForNewFiles: false,
  DropFolderType: 0 as 0 | 1 | 2 | 3,
  Path: '',
  Name: '',
  ID: 0,
};

function ImportFolderModal() {
  const dispatch = useDispatch();

  const status = useSelector((state: RootState) => state.modals.importFolder.status);
  const edit = useSelector((state: RootState) => state.modals.importFolder.edit);
  const ID = useSelector((state: RootState) => state.modals.importFolder.ID);
  const importFolders = useSelector((state: RootState) => state.mainpage.importFolders);

  const [importFolder, setImportFolder] = useState(defaultImportFolder);

  const getFolderDetails = () => {
    setImportFolder(defaultImportFolder);

    if (edit) {
      const folderDetails = find(importFolders, { ID }) ?? {};
      setImportFolder(({ ...importFolder, ...folderDetails }));
    }
  };

  const handleInputChange = (event: any) => {
    const name = event.target.id;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setImportFolder(({ ...importFolder, [name]: value }));
  };

  const handleBrowse = () => dispatch(setBrowseStatus(true));
  const handleClose = () => dispatch(setStatus(false));
  const handleDelete = () => dispatch({ type: Events.IMPORT_FOLDER_DELETE, payload: ID });

  const handleSave = () => {
    if (edit) {
      dispatch({ type: Events.IMPORT_FOLDER_EDIT, payload: importFolder });
    } else {
      dispatch({ type: Events.IMPORT_FOLDER_ADD, payload: importFolder });
    }
  };

  const onFolderSelect = (Path: string) => setImportFolder({ ...importFolder, Path });

  return (
    <React.Fragment>
      <ModalPanel
        show={status}
        className="import-folder-modal px-6 pt-3 pb-6"
        onRequestClose={() => handleClose()}
        onAfterOpen={() => getFolderDetails()}
      >
        <div className="flex flex-col w-full">
          <div className="flex justify-between">
            <span className="flex font-semibold text-xl2 uppercase">
              {edit ? 'Edit Import Folder' : 'Add New Import Folder'}
            </span>
            <span className="flex">
              <Button onClick={() => handleClose()}>
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </span>
          </div>
          <div className="bg-color-highlight-2 my-2 h-1 w-10 flex-shrink-0" />
          <div className="flex flex-col grow w-3/5">
            <Input id="Name" value={importFolder.Name} label="Name" type="text" placeholder="Name" onChange={handleInputChange} className="my-1 w-full" />
            <div className="flex items-end">
              <Input id="Path" value={importFolder.Path} label="Location" type="text" placeholder="Location" onChange={handleInputChange} className="my-1 w-full" />
              <Button onClick={handleBrowse} className="color-highlight-1 ml-2 mb-2 text-lg">
                <FontAwesomeIcon icon={faFolderOpen} />
              </Button>
            </div>
            <span className="flex font-bold mt-2">Type</span>
            <Checkbox label="Watch For New Files" id="WatchForNewFiles" isChecked={importFolder.WatchForNewFiles} onChange={handleInputChange} />
            <Select label="Drop Type" id="DropFolderType" value={importFolder.DropFolderType} onChange={handleInputChange}>
              <option value={0}>None</option>
              <option value={1}>Source</option>
              <option value={2}>Destination</option>
              <option value={3}>Both</option>
            </Select>
          </div>
          <div className="flex justify-end mt-2">
            {edit && (
              <Button onClick={handleDelete} className="bg-color-danger px-5 py-2 mr-2">Delete</Button>
            )}
            <Button onClick={handleSave} className="bg-color-highlight-1 px-5 py-2" disabled={importFolder.Name === '' || importFolder.Path === ''}>Save</Button>
          </div>
        </div>
      </ModalPanel>
      <BrowseFolderModal onSelect={onFolderSelect} />
    </React.Fragment>
  );
}

export default ImportFolderModal;
