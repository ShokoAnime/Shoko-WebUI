import { useMemo } from 'react';
import type { MouseEvent } from 'react';
import {
  mdiDumpTruck,
  mdiFileDocumentAlertOutline,
  mdiFileDocumentCheckOutline,
  mdiFileDocumentPlusOutline,
  mdiFileDocumentRefreshOutline,
  mdiLoading,
} from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import { useAvdumpFilesMutation } from '@/core/react-query/avdump/mutations';
import { useSelector } from '@/core/store';
import toast from '@/core/toast';
import { copyToClipboard, processError } from '@/core/util';
import getEd2kLink from '@/core/utilities/getEd2kLink';

import type { FileType } from '@/core/types/api/file';
import type { AxiosError } from 'axios';

const AVDumpFileIcon = ({ file, truck = false }: { file: FileType, truck?: boolean }) => {
  const avdumpList = useSelector(state => state.utilities.avdump);
  const { mutateAsync: avdumpFiles } = useAvdumpFilesMutation();
  const fileId = file.ID;
  const dumpSession = avdumpList.sessions[avdumpList.sessionMap[fileId]];

  const ed2kHashLink = useMemo(() => getEd2kLink(file), [file]);

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

    if (!file.Locations[0].RelativePath?.includes(file.Hashes.find(hash => hash.Type === 'CRC32')?.Value ?? '')) {
      return {
        path: mdiFileDocumentAlertOutline,
        color: 'text-panel-text-warning',
        title: 'The computed CRC32 does not match or is not present in filename!',
        state: 'info',
      } as const;
    }

    return {
      path: mdiFileDocumentPlusOutline,
      color: 'text-panel-text-primary',
      title: 'File CRC32 is present in filename and matches',
      state: 'info',
    } as const;
  }, [file, dumpSession, truck]);

  const handleDump = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (state === 'idle' || state === 'failed') {
      avdumpFiles({ FileIDs: [fileId], Priority: true })
        .catch((error: AxiosError) => toast.error('AVDump failed!', processError(error)));
    }
  };

  const handleCopy = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    copyToClipboard(ed2kHashLink, 'ED2K hash').catch(console.error);
  };

  return (
    <div className="ml-4 flex">
      {state === 'success'
        ? (
          <Button
            onClick={handleCopy}
            className={color}
            tooltip={title}
          >
            <Icon path={path} spin={path === mdiLoading} size={1} />
          </Button>
        )
        : (
          <Button
            onClick={handleDump}
            className={cx(
              (state !== 'idle' && state !== 'failed' && state !== 'info') && 'pointer-events-none cursor-default',
            )}
            tooltip={title}
          >
            <Icon path={path} spin={path === mdiLoading} size={1} className={color} />
          </Button>
        )}
    </div>
  );
};

export default AVDumpFileIcon;
