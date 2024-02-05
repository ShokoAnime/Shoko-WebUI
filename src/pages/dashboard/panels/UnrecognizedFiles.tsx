import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import AVDumpFileIcon from '@/components/Utilities/Unrecognized/AvDumpFileIcon';
import { useFilesInfiniteQuery } from '@/core/react-query/file/queries';
import { FileSortCriteriaEnum, type FileType } from '@/core/types/api/file';
import { dayjs } from '@/core/util';

import type { RootState } from '@/core/store';

const FileItem = ({ file }: { file: FileType }) => {
  const createdTime = dayjs(file.Created);
  return (
    <div key={file.ID} className="mr-3 flex items-center rounded-lg p-3 odd:bg-panel-background-alt">
      <div className="flex grow flex-col">
        <span className="opacity-65">
          {createdTime.format('YYYY-MM-DD')}
          &nbsp;|&nbsp;
          {createdTime.format('HH:mm')}
        </span>
        <span className="max-w-[95%] break-all">
          {file.Locations[0]?.RelativePath.split(/[/\\]/g).pop() ?? '<missing file path>'}
        </span>
      </div>
      <AVDumpFileIcon truck file={file} />
    </div>
  );
};

function UnrecognizedFiles() {
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
        <div className="mt-4 flex justify-center font-semibold" key="no-files">No Unrecognized Files, Good Job!</div>
      )}
    </ShokoPanel>
  );
}

export default UnrecognizedFiles;
