import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';

import { useGetFilesQuery } from '@/core/rtkQuery/splitV3Api/fileApi';
import { FileSortCriteriaEnum, type FileType } from '@/core/types/api/file';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import AVDumpFileIcon from '@/components/Utilities/Unrecognized/AvDumpFileIcon';

import type { RootState } from '@/core/store';

const FileItem = ({ file }: { file: FileType }) => (
  <div key={file.ID} className="flex items-center">
    <div className="flex flex-col grow">
      <span className="font-semibold">{moment(file.Created).format('yyyy-MM-DD')} / {moment(file.Created).format('hh:mm A')}</span>
      <span className="break-all max-w-[95%]">{file.Locations[0]?.RelativePath.split(/[/\\]/g).pop() ?? '<missing file path>'}</span>
    </div>
    <AVDumpFileIcon truck file={file} />
  </div>
);

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
