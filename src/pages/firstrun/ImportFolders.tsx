import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { omit } from 'lodash';
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
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
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
      <div className="flex font-mulish items-center w-full my-2">
        <Button onClick={() => handleEdit(folder)} className="flex mr-2 color-highlight-1">
          <FontAwesomeIcon icon={faEdit} />
        </Button>
        <Button onClick={() => dispatch({ type: Events.IMPORT_FOLDER_DELETE, payload: folder.ID })} className="flex mr-4 color-highlight-1">
          <FontAwesomeIcon icon={faTrashAlt} />
        </Button>
        <div className="flex flex-col">
          <div className="flex">
            <span className="flex font-semibold mr-1">{`${Name} -`}</span>
            <span className="flex">{Path}</span>
          </div>
          <span className="flex">{flags}</span>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    const {
      Name, WatchForNewFiles, DropFolderType, Path, showEdit,
    } = newImportFolder;
    return (
      <div className="flex flex-col mt-4 w-3/5">
        <div className="flex justify-between items-center font-mulish">
          Name
          <InputSmall id="Name" value={Name} type="text" placeholder="Name" onChange={handleInputChange} className="my-1 w-80 p-2" />
        </div>
        <div className="flex justify-between items-center font-mulish">
          Path
          <div className="flex">
            <InputSmall id="Path" value={Path} type="text" placeholder="Path" onChange={handleInputChange} className="my-1 w-72 p-2" />
            <Button onClick={() => dispatch(setBrowseStatus(true))} className="color-highlight-1 ml-2 text-lg">
              <FontAwesomeIcon icon={faFolderOpen} className="align-middle" />
            </Button>
          </div>
        </div>
        <div className="flex font-bold mt-2">Type</div>
        <Checkbox label="Watch For New Files" id="WatchForNewFiles" isChecked={WatchForNewFiles} onChange={handleInputChange} className="mt-2 mb-1" />
        <SelectSmall label="Drop Type" id="DropFolderType" value={DropFolderType} onChange={handleInputChange} className="my-1">
          <option value={0}>None</option>
          <option value={1}>Source</option>
          <option value={2}>Destination</option>
          <option value={3}>Both</option>
        </SelectSmall>
        <span className="flex mt-6">
          {showEdit ? (
            <Button onClick={() => handleEditFolder()} className="bg-color-highlight-1 py-2 px-3 rounded text-sm">
              Edit Import Folder
            </Button>
          ) : (
            <Button onClick={() => handleAddFolder()} className="bg-color-highlight-1 py-2 px-3 rounded text-sm" disabled={Name === '' || Path === ''}>
              Add Import Folder
            </Button>
          )}
          <Button onClick={() => setNewImportFolder(defaultState)} className="bg-color-highlight-1 py-2 px-3 rounded text-sm ml-2">
            Cancel
          </Button>
        </span>
      </div>
    );
  };

  return (
    <React.Fragment>
      <TransitionDiv className="flex flex-col flex-grow justify-center overflow-y-auto">
        <div className="font-bold text-lg">Import Folders</div>
        <div className="font-mulish mt-5 text-justify">
          Shoko requires at least <span className="font-bold">one</span> import folder in order to work properly, however you can
          have as many import folders as you&apos;d like. Please note you can only have <span className="font-bold">one</span> folder
          designated as your drop destination.
        </div>
        <div className="flex flex-col my-8 overflow-y-auto">
          <div className="font-bold">Current Import Folders</div>
          <div className="flex flex-col">{importFolders.map(folder => renderFolder(folder))}</div>
          <div className="flex mt-2">
            <Button onClick={() => setNewImportFolder({ ...newImportFolder, showAddNew: !newImportFolder.showAddNew })} className="bg-color-highlight-1 py-1 px-2 text-sm">Add New</Button>
          </div>
          {newImportFolder.showAddNew && renderForm()}
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
