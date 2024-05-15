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

import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import { useAvdumpFilesMutation } from '@/core/react-query/avdump/mutations';
import { copyToClipboard } from '@/core/util';
import useEventCallback from '@/hooks/useEventCallback';

import type { RootState } from '@/core/store';
import type { FileType } from '@/core/types/api/file';

const AVDumpFileIcon = ({ file, truck = false }: { file: FileType, truck?: boolean }) => {
  const avdumpList = useSelector((state: RootState) => state.utilities.avdump);
  const { mutate: avdumpFiles } = useAvdumpFilesMutation();
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
        color: 'text-panel-text-primary',
        title: 'Dumping Now!',
        state: 'running',
      } as const;
    }

    if (dumpSession?.status === 'Failed') {
      return {
        path: mdiFileDocumentAlertOutline,
        color: 'text-panel-icon-danger',
        title: 'Dump Failed!',
        state: 'failed',
      } as const;
    }

    if (dumpSession?.status === 'Success') {
      return {
        path: mdiFileDocumentCheckOutline,
        color: 'text-panel-icon-important',
        title: 'Dumped Successfully!',
        state: 'success',
      } as const;
    }

    if (file.AVDump.Status === 'Queued') {
      return {
        path: mdiFileDocumentRefreshOutline,
        color: 'text-panel-icon-action',
        title: 'Dumping Queued!',
        state: 'queued',
      } as const;
    }

    if (file.AVDump.LastDumpedAt) {
      return {
        path: mdiFileDocumentCheckOutline,
        color: 'text-panel-icon-important',
        title: 'Previously Dumped!',
        state: 'success',
      } as const;
    }

    if (truck) {
      return {
        path: mdiDumpTruck,
        color: 'text-panel-icon-action',
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

  const handleDump = useEventCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (state === 'idle' || state === 'failed') {
      avdumpFiles({ FileIDs: [fileId], Priority: true });
    }
  });

  const handleCopy = useEventCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    copyToClipboard(hash)
      .then(() => toast.success('ED2K hash copied to clipboard!'))
      .catch(() => toast.error('ED2K hash copy failed!'));
  });

  return (
    <div className="ml-4 flex">
      {state === 'success'
        ? (
          <Button
            onClick={handleCopy}
            className={color}
          >
            <Icon path={path} spin={path === mdiLoading} size={1} title={title} />
          </Button>
        )
        : (
          <Button
            onClick={handleDump}
            className={cx((state !== 'idle' && state !== 'failed') && 'cursor-default pointer-events-none')}
            tooltip="Dump File"
          >
            <Icon path={path} spin={path === mdiLoading} size={1} className={color} title={title} />
          </Button>
        )}
    </div>
  );
};

export default AVDumpFileIcon;
