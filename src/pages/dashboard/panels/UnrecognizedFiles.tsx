import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { mdiDatabaseSearchOutline } from '@mdi/js';
import Icon from '@mdi/react';

import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import AVDumpFileIcon from '@/components/Utilities/Unrecognized/AvDumpFileIcon';
import { useRescanFileMutation } from '@/core/react-query/file/mutations';
import { useFilesInfiniteQuery } from '@/core/react-query/file/queries';
import { FileSortCriteriaEnum, type FileType } from '@/core/types/api/file';
import { dayjs } from '@/core/util';

import type { RootState } from '@/core/store';

const FileItem = ({ file }: { file: FileType }) => {
  const createdTime = dayjs(file.Created);
  const fileName = file.Locations[0]?.RelativePath.split(/[/\\]/g).pop() ?? '<missing file path>';
  const { mutate: rescanFile } = useRescanFileMutation();
  const handleRescan = (id: number) =>
    rescanFile(id, {
      onSuccess: () => toast.success('Rescanning file!'),
      onError: error => toast.error(`Rescan failed for file! ${error.message}`),
    });

  return (
    <div
      key={file.ID}
      className="mr-3 flex items-center rounded-md p-3 even:bg-panel-background-alt"
    >
      <div
        className="flex grow flex-col"
        data-tooltip-id="tooltip"
        data-tooltip-content={fileName}
      >
        <span className="opacity-65">
          {createdTime.format('YYYY-MM-DD')}
          &nbsp;|&nbsp;
          {createdTime.format('HH:mm')}
        </span>
        <span className="max-w-[95%] break-all">
          {fileName}
        </span>
      </div>
      <Button onClick={() => handleRescan(file.ID)} tooltip="Rescan File">
        <Icon
          className="text-panel-icon-action"
          path={mdiDatabaseSearchOutline}
          size={1}
          horizontal
          vertical
          rotate={180}
        />
      </Button>
      <AVDumpFileIcon truck file={file} />
    </div>
  );
};

const UnrecognizedFiles = () => {
  const filesQuery = useFilesInfiniteQuery({
    pageSize: 20,
    include_only: ['Unrecognized'],
    sortOrder: [FileSortCriteriaEnum.FileID * -1],
  });
  const [files, fileCount] = useMemo(
    () => {
      if (filesQuery.isSuccess) {
        return [
          filesQuery.data.pages.flatMap(page => page.List),
          filesQuery.data.pages[0].Total,
        ];
      }
      return [[], 0];
    },
    [filesQuery.data, filesQuery.isSuccess],
  );

  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  return (
    <ShokoPanel
      title={
        <div className="flex w-full flex-row justify-between">
          <div>Unrecognized Files</div>
        </div>
      }
      options={
        <div className="text-xl font-semibold">
          <span className="text-panel-text-important">{fileCount}</span>
          &nbsp;
          <span>{fileCount === 1 ? 'File' : 'Files'}</span>
        </div>
      }
      isFetching={filesQuery.isPending}
      editMode={layoutEditMode}
    >
      {files.map(file => <FileItem file={file} key={file.ID} />)}
      {fileCount === 0 && (
        <div className="flex grow items-center justify-center pb-14 font-semibold" key="no-files">
          No unrecognized files. Good job!
        </div>
      )}
    </ShokoPanel>
  );
};

export default UnrecognizedFiles;
