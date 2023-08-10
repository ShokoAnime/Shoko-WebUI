import React, { useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useDispatch, useSelector } from 'react-redux';
import { mdiContentCopy, mdiDumpTruck, mdiFileDocumentCheckOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import moment from 'moment';

import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import { useGetFilesQuery, useLazyPostFileAVDumpQuery } from '@/core/rtkQuery/splitV3Api/fileApi';
import { setItem as setAvdumpItem } from '@/core/slices/utilities/avdump';
import { FileSortCriteriaEnum, type FileType } from '@/core/types/api/file';

import type { RootState } from '@/core/store';

const FileItem = ({ file }: { file: FileType }) => {
  const dispatch = useDispatch();

  const [avdumpTrigger] = useLazyPostFileAVDumpQuery();

  const avdumpList = useSelector((state: RootState) => state.utilities.avdump);
  const [dumpInProgress, setDumpInProgress] = useState(false);

  const avdumpFile = async (fileId: number) => {
    setDumpInProgress(true);
    dispatch(setAvdumpItem({ id: fileId, hash: '', fetching: true }));
    const result = await avdumpTrigger(fileId);
    dispatch(setAvdumpItem({ id: fileId, hash: result.data?.Ed2k ?? 'x', fetching: false }));
    setDumpInProgress(false);
  };

  return (
    <div key={file.ID} className="flex items-center">
      <div className="flex grow flex-col">
        <span className="font-semibold">
          {moment(file.Created).format('yyyy-MM-DD')}
          &nbsp;/
          {moment(file.Created).format('hh:mm A')}
        </span>
        <span className="max-w-[95%] break-all">
          {file.Locations[0]?.RelativePath.split(/[/\\]/g).pop() ?? '<missing file path>'}
        </span>
      </div>
      <div className="flex justify-between">
        {(avdumpList[file.ID] === undefined || avdumpList[file.ID].fetching) && (
          <Button
            onClick={() => avdumpFile(file.ID)}
            className="px-2"
            loading={avdumpList[file.ID]?.fetching ?? false}
            disabled={dumpInProgress}
            tooltip="Dump File"
          >
            <Icon className="text-panel-primary" path={mdiDumpTruck} size={1} />
          </Button>
        )}
        {(avdumpList[file.ID] && !avdumpList[file.ID].fetching) && (
          <div className="flex gap-x-2 px-2">
            <CopyToClipboard text={avdumpList[file.ID].hash || ''} onCopy={() => toast.success('Copied to clipboard!')}>
              <Icon className="cursor-pointer text-panel-primary" path={mdiContentCopy} size={1} />
            </CopyToClipboard>
            <Icon className="text-panel-important" path={mdiFileDocumentCheckOutline} size={1} />
          </div>
        )}
      </div>
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
