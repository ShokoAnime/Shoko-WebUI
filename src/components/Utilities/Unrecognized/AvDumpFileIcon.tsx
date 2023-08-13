import cx from 'classnames';
import { throttle } from 'lodash';
import React, { useMemo } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useDispatch, useSelector } from 'react-redux';
import { useEventCallback } from 'usehooks-ts';
import { mdiDumpTruck, mdiFileDocumentAlertOutline, mdiFileDocumentCheckOutline, mdiFileDocumentRefreshOutline, mdiInformationOutline, mdiLoading } from '@mdi/js';
import Icon from '@mdi/react';

import { splitV3Api } from '@/core/rtkQuery/splitV3Api';
import { useLazyPostFileAVDumpQuery } from '@/core/rtkQuery/splitV3Api/fileApi';
import { RootState } from '@/core/store';
import { FileType } from '@/core/types/api/file';

import Button from '@/components/Input/Button';
import toast from '@/components/Toast';

// This should be shared across _all_ icons. That's why it's not defined outside
// the component body. This is to throttle the invalidate events sent to RTK
// query.
const throttledFn = throttle((fn: () => any) => fn(), 1000);

const AVDumpFileIcon = ({ file, truck = false }: { file: FileType; truck?: boolean }) => {
  const dispatch = useDispatch();
  const avdumpList = useSelector((state: RootState) => state.utilities.avdump);
  const [fileAvdumpTrigger] = useLazyPostFileAVDumpQuery();
  const fileId = file.ID;
  const dumpSession = avdumpList.sessions[avdumpList.sessionMap[fileId]];
  const hash = useMemo(() => `ed2k://|file|${file.Locations[0]?.RelativePath?.split(/[\\/]+/g).pop() ?? ''}|${file.Size}|${file.Hashes.ED2K}|/`, [file]);
  const { color, path, state, title } = useMemo(() => {
    if (dumpSession?.status === 'Running') {
      return {
        path: mdiLoading,
        color: 'text-panel-primary',
        title: 'Dumping Now!',
        state: 'running',
      } as const;
    }

    if (dumpSession?.status === 'Failed') {
      return {
        path: mdiFileDocumentAlertOutline,
        color: 'text-panel-danger',
        title: 'Dump Failed!',
        state: 'failed',
      } as const;
    }

    if (dumpSession?.status === 'Success') {
      return {
        path: mdiFileDocumentCheckOutline,
        color: 'text-panel-important',
        title: 'Dumped Successfully!',
        state: 'success',
      } as const;
    }

    if (file.AVDump.Status === 'Queued') {
      return {
        path: mdiFileDocumentRefreshOutline,
        color: 'text-panel-warning',
        title: 'Dumping Queued!',
        state: 'queued',
      } as const;
    }

    if (file.AVDump.LastDumpedAt) {
      return {
        path: mdiFileDocumentCheckOutline,
        color: 'text-panel-important',
        title: 'Previously Dumped!',
        state: 'success',
      } as const;
    }

    if (truck) {
      return {
        path: mdiDumpTruck,
        color: 'text-panel-primary',
        title: 'Click to Dump!',
        state: 'idle',
      } as const;
    }

    return {
      path: mdiInformationOutline,
      color: 'text-panel-text',
      title: 'Click to Dump!',
      state: 'idle',
    } as const;
  }, [file, dumpSession, truck]);

  const handleClick = useEventCallback(async () => {
    if (state === 'idle' || state === 'failed') {
      await fileAvdumpTrigger(fileId);
      throttledFn(() => {
        dispatch(splitV3Api.util.invalidateTags(['AVDumpEvent']));
      });
    }
  });

  return (
    <div className="flex ml-4">
      {state === 'success' ? (
        <CopyToClipboard text={hash} onCopy={() => toast.success('Copied to clipboard!')}>
          <Icon path={path} spin={path === mdiLoading} size={1} className={`${color} cursor-pointer`} title={title} />
        </CopyToClipboard>
      ) : (
        <Button onClick={handleClick} className={cx((state !== 'idle' && state !== 'failed') && 'cursor-default pointer-events-none')}>
          <Icon path={path} spin={path === mdiLoading} size={1} className={color} title={title} />
        </Button>
      )}
    </div>
  );
};

export default AVDumpFileIcon;
