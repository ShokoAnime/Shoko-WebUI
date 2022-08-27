import React from 'react';
import moment from 'moment';
import { find } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import { Icon } from '@mdi/react';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

import TransitionDiv from '../../../../components/TransitionDiv';
import ShokoPanel from '../../../../components/Panels/ShokoPanel';
import Button from '../../../../components/Input/Button';
import { setSelectedFile } from '../../../../core/slices/utilities/unrecognized';

import { RootState } from '../../../../core/store';
import { useGetImportFoldersQuery } from '../../../../core/rtkQuery/importFolderApi';
import { ImportFolderType } from '../../../../core/types/api/import-folder';

const SelectedFileInfo = () => {
  const importFolderQuery = useGetImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];
  const { selectedFile, selectedRows } = useSelector((state: RootState) => state.utilities.unrecongnized);
  const dispatch = useDispatch();

  const changeSelectedFile = (operation: string) => {
    if (operation === 'prev') {
      if (selectedFile > 1) {
        dispatch(setSelectedFile(selectedFile - 1));
      }
    } else {
      if (selectedFile < selectedRows.length) {
        dispatch(setSelectedFile(selectedFile + 1));
      }
    }
  };
  
  const fileInfoTitle = () => {
    const isEmpty = selectedRows.length <= 0;
    return (
      <React.Fragment>
        Selected File Info
        <TransitionDiv className="flex ml-2" show={!isEmpty}>
          - <span className="text-highlight-2 ml-2">{isEmpty ? '-/-' : `${selectedFile}/${selectedRows.length}`}</span>
        </TransitionDiv>
      </React.Fragment>
    );
  };

  const renderPanelOptions = () => (
    <div className="flex">
      <Button onClick={() => changeSelectedFile('prev')}>
        <Icon path={mdiChevronLeft} size={1} className="opacity-75 text-highlight-1" />
      </Button>
      <Button onClick={() => changeSelectedFile('next')} className="ml-2">
        <Icon path={mdiChevronRight} size={1} className="opacity-75 text-highlight-1" />
      </Button>
    </div>
  );

  const renderFileInfo = () => {
    if (selectedRows.length === 0) return;
    const selectedFileInfo = selectedRows[selectedFile - 1];

    const importFolderId = selectedFileInfo.Locations[0].ImportFolderID;
    const importFolder = find(importFolders, { ID: importFolderId })?.Path ?? '';

    return (
      <>
        <div className="flex">
          <div className="flex flex-col w-2/5">
            <div className="font-semibold mb-1">Filename</div>
            {selectedFileInfo.Locations[0].RelativePath}
          </div>

          <div className="flex flex-col w-1/5">
            <div className="font-semibold mb-1">Size</div>
            {prettyBytes(selectedFileInfo.Size, { binary: true })}
          </div>

          <div className="flex flex-col w-1/4">
            <div className="font-semibold mb-1">Folder</div>
            {importFolder}
          </div>

          <div className="flex flex-col w-48">
            <div className="font-semibold mb-1">Import Date</div>
            {moment(selectedFileInfo.Created).format('MMMM DD YYYY, HH:mm')}
          </div>
        </div>

        <div className="flex mt-4">
          <div className="flex flex-col w-2/5">
            <div className="font-semibold mb-1">Hash</div>
            {selectedFileInfo.Hashes.ED2K}
          </div>

          <div className="flex flex-col w-1/5">
            <div className="font-semibold mb-1">MD5</div>
            {selectedFileInfo.Hashes.MD5}
          </div>

          <div className="flex flex-col w-1/4">
            <div className="font-semibold mb-1">SHA1</div>
            {selectedFileInfo.Hashes.SHA1}
          </div>

          <div className="flex flex-col w-48">
            <div className="font-semibold mb-1">CRC32</div>
            {selectedFileInfo.Hashes.CRC32}
          </div>
        </div>
      </>
    );
  };
  
  return (
    <ShokoPanel title={fileInfoTitle()} className="!h-48 mt-4" options={renderPanelOptions()}>
      <div className="flex grow flex-col items-center relative">
        <TransitionDiv className="mt-2 font-semibold absolute" show={selectedRows.length === 0}>
          No File(s) Selected
        </TransitionDiv>
        <TransitionDiv className="flex grow flex-col mt-2 w-full absolute" show={selectedRows.length !== 0}>
          {renderFileInfo()}
        </TransitionDiv>
      </div>
    </ShokoPanel>
  );
};

export default SelectedFileInfo;