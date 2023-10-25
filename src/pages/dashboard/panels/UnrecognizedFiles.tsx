import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import AVDumpFileIcon from '@/components/Utilities/Unrecognized/AvDumpFileIcon';
import { useGetFilesQuery } from '@/core/rtkQuery/splitV3Api/fileApi';
import { FileSortCriteriaEnum, type FileType } from '@/core/types/api/file';
import { dayjs } from '@/core/util';

import type { RootState } from '@/core/store';

const FileItem = ({ file }: { file: FileType }) => {
  const createdTime = dayjs(file.Created);
  return (
    <div key={file.ID} className="flex items-center">
      <div className="flex grow flex-col">
        <span className="font-semibold">
          {createdTime.format('YYYY-MM-DD')}
          &nbsp;/&nbsp;
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
  const filesQuery = useGetFilesQuery({
    pageSize: 20,
    includeUnrecognized: 'only',
    sortOrder: [FileSortCriteriaEnum.FileID * -1],
  });
  const files = useMemo(() => filesQuery.data ?? { Total: 0, List: [] }, [filesQuery]);

  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  return (
    <ShokoPanel
      title="Unrecognized Files"
      isFetching={filesQuery.isLoading}
      editMode={layoutEditMode}
      contentClassName="gap-y-3"
    >
      {files.List.map(file => <FileItem file={file} key={file.ID} />)}
      {files.Total === 0 && (
        <div className="mt-4 flex justify-center font-semibold" key="no-files">No Unrecognized Files, Good Job!</div>
      )}
    </ShokoPanel>
  );
}

export default UnrecognizedFiles;
