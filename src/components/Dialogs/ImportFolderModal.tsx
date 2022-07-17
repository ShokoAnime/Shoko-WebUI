import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { find } from 'lodash';
import { mdiFolderOpen } from '@mdi/js';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import Button from '../Input/Button';
import Input from '../Input/Input';
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
    const value = name === 'WatchForNewFiles' ? event.target.value === 1 : event.target.value;
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
        className="pb-6"
        onRequestClose={() => handleClose()}
        onAfterOpen={() => getFolderDetails()}
      >
        <div className="flex flex-col w-full">
          <div className="flex flex-col items-center justify-start bg-color-nav">
            <div className="grow px-4 py-2 bg-background-alt self-stretch border-b border-background-border shadow">
              <p className="text-base font-semibold text-gray-300">{edit ? 'Edit Import Folder' : 'Add New Import Folder'}</p>
            </div>
            <div className="flex flex-col space-y-4 items-end justify-center p-4 w-full">
              <Input id="Name" value={importFolder.Name} label="Name" type="text" placeholder="Folder name" onChange={handleInputChange} className="w-full" />
              <Input id="Path" value={importFolder.Path} label="Location" type="text" placeholder="Location" onChange={handleInputChange} className="w-full" endIcon={mdiFolderOpen} endIconClick={handleBrowse}/>
              <Select label="Drop Type" id="DropFolderType" value={importFolder.DropFolderType} onChange={handleInputChange} className="w-full">
                <option value={0}>None</option>
                <option value={1}>Source</option>
                <option value={2}>Destination</option>
                <option value={3}>Both</option>
              </Select>
              <Select label="Watch For New Files" id="WatchForNewFiles" value={importFolder.WatchForNewFiles ? 1 : 0} onChange={handleInputChange} className="w-full">
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </Select>
              <div className="flex justify-end">
                {edit && (
                  <Button onClick={handleDelete} className="bg-background-alt px-6 py-2 mr-2">Delete</Button>
                )}
                <Button onClick={handleClose} className="bg-background-alt px-6 py-2 mr-2">Cancel</Button>
                <Button onClick={handleSave} className="bg-primary px-6 py-2" disabled={importFolder.Name === '' || importFolder.Path === ''}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      </ModalPanel>
      <BrowseFolderModal onSelect={onFolderSelect} />
    </React.Fragment>
  );
}

export default ImportFolderModal;
