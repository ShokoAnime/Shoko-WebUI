import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  mdiDumpTruck,
  mdiFileDocumentAlertOutline,
  mdiFileDocumentCheckOutline,
  mdiFileDocumentRefreshOutline,
  mdiInformationOutline,
  mdiLoading,
} from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import { useEventCallback } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import { usePostFileAVDumpMutation } from '@/core/rtkQuery/splitV3Api/fileApi';
import { copyToClipboard } from '@/core/util';

import type { RootState } from '@/core/store';
import type { FileType } from '@/core/types/api/file';

const AVDumpFileIcon = ({ file, truck = false }: { file: FileType, truck?: boolean }) => {
  const avdumpList = useSelector((state: RootState) => state.utilities.avdump);
  const [fileAvdumpTrigger] = usePostFileAVDumpMutation();
  const fileId = file.ID;
  const dumpSession = avdumpList.sessions[avdumpList.sessionMap[fileId]];

  const hash = useMemo(
    () =>
      `ed2k://|file|${
        file.Locations[0]?.RelativePath?.split(/[\\/]+/g).pop() ?? ''
      }|${file.Size}|${file.Hashes.ED2K}|/`,
    [file],
  );

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

  const handleDump = useEventCallback(async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (state === 'idle' || state === 'failed') {
      await fileAvdumpTrigger(fileId);
    }
  });

  const handleCopy = (event: React.MouseEvent) => {
    event.stopPropagation();
    copyToClipboard(hash)
      .then(() => toast.success('ED2K hash copied to clipboard!'))
      .catch(() => toast.error('ED2K hash copy failed!'));
  };

  return (
    <div className="ml-4 flex">
      {state === 'success'
        ? (
          <div onClick={handleCopy}>
            <Icon path={path} spin={path === mdiLoading} size={1} className={`${color} cursor-pointer`} title={title} />
          </div>
        )
        : (
          <Button
            onClick={handleDump}
            className={cx((state !== 'idle' && state !== 'failed') && 'cursor-default pointer-events-none')}
          >
            <Icon path={path} spin={path === mdiLoading} size={1} className={color} title={title} />
          </Button>
        )}
    </div>
  );
};

export default AVDumpFileIcon;
