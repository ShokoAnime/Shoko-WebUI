import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { omit } from 'lodash';
import { Icon } from '@mdi/react';
import {
  mdiFolderOpen, mdiSquareEditOutline,
  mdiTrashCanOutline,
} from '@mdi/js';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { setSaved as setFirstRunSaved } from '../../core/slices/firstrun';
import Button from '../../components/Input/Button';
import Input from '../../components/Input/Input';
import Footer from './Footer';
import BrowseFolderModal from '../../components/Dialogs/BrowseFolderModal';
import { setStatus as setBrowseStatus } from '../../core/slices/modals/browseFolder';
import type { ImportFolderType } from '../../core/types/api/import-folder';
import Select from '../../components/Input/Select';
import TransitionDiv from '../../components/TransitionDiv';

const defaultState = {
  showAddNew: false,
  showEdit: false,
  WatchForNewFiles: false,
  DropFolderType: 0 as 0 | 1 | 2 | 3,
  Path: '',
  Name: '',
  ID: 0,
};

function ImportFolders() {
  const dispatch = useDispatch();

  const importFolders = useSelector((state: RootState) => state.mainpage.importFolders);

  const [newImportFolder, setNewImportFolder] = useState(defaultState);

  const handleInputChange = (event: any) => {
    const name = event.target.id;
    let value = event.target.value;
    if (value === 'True') value = true;
    if (value === 'False') value = false;
    setNewImportFolder({ ...newImportFolder, [name]: value });
  };

  const handleAddFolder = () => {
    dispatch({ type: Events.IMPORT_FOLDER_ADD, payload: omit(newImportFolder, ['showAddNew', 'showEdit']) });
    setNewImportFolder(defaultState);
  };

  const handleEdit = (folder: ImportFolderType) => {
    setNewImportFolder({
      showAddNew: true,
      showEdit: true,
      Name: folder.Name,
      WatchForNewFiles: folder.WatchForNewFiles ?? false,
      DropFolderType: folder.DropFolderType ?? 0,
      Path: folder.Path,
      ID: folder.ID,
    });
  };

  const handleEditFolder = () => {
    dispatch({ type: Events.IMPORT_FOLDER_EDIT, payload: omit(newImportFolder, ['showAddNew', 'showEdit']) });
    setNewImportFolder(defaultState);
  };

  const renderFolder = (folder: ImportFolderType) => {
    const {
      DropFolderType, WatchForNewFiles,
      Name, Path,
    } = folder;

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
    if (WatchForNewFiles) {
      flags += DropFolderType ? ', Watch For New Files' : 'Watch For New Files';
    }

    return (
      <div className="flex items-center w-full mt-1 first:mt-0">
        <Button onClick={() => handleEdit(folder)} className="text-highlight-1 mr-1">
          <Icon path={mdiSquareEditOutline} size={1} />
        </Button>
        <Button onClick={() => dispatch({ type: Events.IMPORT_FOLDER_DELETE, payload: folder.ID })} className="mr-3 text-highlight-3">
          <Icon path={mdiTrashCanOutline} size={1} />
        </Button>
        <div className="flex grow">
          <div className="grow">
            <span className="font-semibold mr-1">{Name}</span>
            <span className="opacity-75 text-xs">({flags})</span>
          </div>
          <div>{Path}</div>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    const {
      Name, WatchForNewFiles, DropFolderType, Path, showEdit,
    } = newImportFolder;
    return (
      <TransitionDiv className="flex flex-col mt-6 w-3/5">
        <Input label="Name" id="Name" value={Name} type="text" placeholder="Name" onChange={handleInputChange} />
        <div className="flex mt-9 items-end">
          <Input label="Location" id="Path" value={Path} type="text" placeholder="Location" onChange={handleInputChange} className="grow" />
          {/* TODO: Move folder icon into the input field */}
          <Button onClick={() => dispatch(setBrowseStatus(true))} className="text-highlight-1 ml-2 mb-1">
            <Icon path={mdiFolderOpen} size={1} />
          </Button>
        </div>
        <Select label="Drop Type" id="DropFolderType" value={DropFolderType} onChange={handleInputChange} className="mt-9">
          <option value={0}>None</option>
          <option value={1}>Source</option>
          <option value={2}>Destination</option>
          <option value={3}>Both</option>
        </Select>
        <Select label="Watch For New Files" id="WatchForNewFiles" value={WatchForNewFiles ? 'True' : 'False'} onChange={handleInputChange} className="mt-9">
          <option value="False">No</option>
          <option value="True">Yes</option>
        </Select>
        <span className="flex mt-9">
          {showEdit ? (
            <Button onClick={() => handleEditFolder()} className="bg-highlight-1 py-2 px-3">
              Edit Import Folder
            </Button>
          ) : (
            <Button onClick={() => handleAddFolder()} className="bg-highlight-1 py-2 px-3" disabled={Name === '' || Path === ''}>
              Add Import Folder
            </Button>
          )}
          <Button onClick={() => setNewImportFolder(defaultState)} className="bg-highlight-1 py-2 px-3 rounded text-sm ml-2">
            Cancel
          </Button>
        </span>
      </TransitionDiv>
    );
  };

  return (
    <React.Fragment>
      <TransitionDiv className="flex flex-col justify-center overflow-y-auto px-96">
        <div className="font-semibold">Import Folders</div>
        <div className="mt-9 text-justify">
          Shoko requires at least <span className="font-bold">one</span> import folder in order to work properly, however you can
          have as many import folders as you&apos;d like. Please note you can only have <span className="font-bold">one</span> folder
          designated as your drop destination.
        </div>
        <div className="flex flex-col my-9 overflow-y-auto">
          <div className="font-semibold border-b border-background-border pb-3">Current Import Folders</div>
          {!newImportFolder.showAddNew ? (
            <React.Fragment>
              <div className="flex flex-col my-6">{importFolders.map(folder => renderFolder(folder))}</div>
              <div className="flex">
                <Button onClick={() => setNewImportFolder({ ...newImportFolder, showAddNew: !newImportFolder.showAddNew })} className="bg-highlight-1 py-2 px-3">Add Import Folder</Button>
              </div>
            </React.Fragment>
          ) : renderForm()}
        </div>
        <Footer nextPage="data-collection" saveFunction={() => dispatch(setFirstRunSaved('import-folders'))} />
      </TransitionDiv>
      <BrowseFolderModal
        onSelect={(folder: string) => setNewImportFolder({ ...newImportFolder, Path: folder })}
      />
    </React.Fragment>
  );
}

export default ImportFolders;
