import React from 'react';
import moment from 'moment';
import { find, get } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import { Icon } from '@mdi/react';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import cx from 'classnames';

import TransitionDiv from '../../../../components/TransitionDiv';
import ShokoPanel from '../../../../components/Panels/ShokoPanel';
import Button from '../../../../components/Input/Button';
import { setSelectedFile } from '../../../../core/slices/utilities/unrecognized';

import { RootState } from '../../../../core/store';
import { useGetImportFoldersQuery } from '../../../../core/rtkQuery/splitV3Api/importFolderApi';
import { ImportFolderType } from '../../../../core/types/api/import-folder';

type Props = {
  fullWidth: boolean;
};

const SelectedFileInfo = ({ fullWidth }: Props) => {
  const importFolderQuery = useGetImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];
  const { selectedFile, selectedRows } = useSelector((state: RootState) => state.utilities.unrecognized);
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

    const importFolderId = get(selectedFileInfo, 'Locations.0.ImportFolderID', -1);
    const importFolder = importFolderId === -1 ? '' : find(importFolders, { ID: importFolderId })?.Path ?? '';

    return (
      <TransitionDiv className="flex grow w-full absolute" show={!fullWidth && selectedRows.length !== 0}>
        <div className="flex flex-col w-2/3 break-all">
          <div className="flex flex-col">
            <div className="font-semibold mb-1">Filename</div>
            {get(selectedFileInfo, 'Locations.0.RelativePath', '')}
          </div>

          <div className="flex flex-col mt-4">
            <div className="font-semibold mb-1">Size</div>
            {prettyBytes(selectedFileInfo.Size, { binary: true })}
          </div>

          <div className="flex flex-col mt-4">
            <div className="font-semibold mb-1">Folder</div>
            {importFolder}
          </div>

          <div className="flex flex-col mt-4">
            <div className="font-semibold mb-1">Import Date</div>
            {moment(selectedFileInfo.Created).format('MMMM DD YYYY, HH:mm')}
          </div>
        </div>

        <div className="flex flex-col w-1/3 break-all">
          <div className="flex flex-col">
            <div className="font-semibold mb-1">Hash</div>
            {selectedFileInfo.Hashes.ED2K}
          </div>

          <div className="flex flex-col mt-4">
            <div className="font-semibold mb-1">MD5</div>
            {selectedFileInfo.Hashes.MD5}
          </div>

          <div className="flex flex-col mt-4">
            <div className="font-semibold mb-1">SHA1</div>
            {selectedFileInfo.Hashes.SHA1}
          </div>

          <div className="flex flex-col mt-4">
            <div className="font-semibold mb-1">CRC32</div>
            {selectedFileInfo.Hashes.CRC32}
          </div>
        </div>
      </TransitionDiv>
    );
  };

  const renderFullWidthFileInfo = () => {
    if (selectedRows.length === 0) return;
    const selectedFileInfo = selectedRows[selectedFile - 1];

    const importFolderId = get(selectedFileInfo, 'Locations.0.ImportFolderID', -1);
    const importFolder = importFolderId === -1 ? '' : find(importFolders, { ID: importFolderId })?.Path ?? '';

    return (
      <TransitionDiv className="flex flex-col grow w-full absolute" show={fullWidth && selectedRows.length !== 0}>
        <div className="flex break-all">
          <div className="flex flex-col w-2/5">
            <div className="font-semibold mb-1">Filename</div>
            {selectedFileInfo.Locations?.[0].RelativePath ?? ''}
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

        <div className="flex break-all mt-4">
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
      </TransitionDiv>
    );
  };

  return (
    <ShokoPanel title={fileInfoTitle()} className={cx('transition-[width]', fullWidth ? 'w-full' : 'w-3/4')} options={renderPanelOptions()}>
      <div className="flex grow relative overflow-y-auto">
        <TransitionDiv className="flex justify-center font-semibold absolute w-full mt-4" show={selectedRows.length === 0}>
          No File(s) Selected
        </TransitionDiv>
        {renderFileInfo()}
        {renderFullWidthFileInfo()}
      </div>
    </ShokoPanel>
  );
};

export default SelectedFileInfo;
