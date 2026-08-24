import type { ReactNode } from 'react';
import { find } from 'lodash';
import prettyBytes from 'pretty-bytes';

import { dayjs, extractFileNameFromPath } from '@/core/util';

import type { EpisodeType } from '@/core/types/api/episode';
import type { FileType } from '@/core/types/api/file';
import type { ManagedFolderType } from '@/core/types/api/managed-folder';
import type { ReleaseManagementSeriesType, SeriesType } from '@/core/types/api/series';

export type UtilityHeaderType<T extends EpisodeType | FileType | SeriesType | ReleaseManagementSeriesType> = {
  id: string;
  name: string;
  className: string;
  item: (_: T) => ReactNode;
};

export const criteriaMap = {
  managedFolder: 'ManagedFolderName',
  filename: 'FileName',
  crc32: 'CRC32',
  size: 'FileSize',
  created: 'CreatedAt',
  status: null,
} as const;

export const getManagedFolderColumn = (managedFolders: ManagedFolderType[]): UtilityHeaderType<FileType> => ({
  id: 'managedFolder',
  name: 'Managed Folder',
  className: 'w-46',
  item: (file) => {
    const managedFolder = find(
      managedFolders,
      { ID: file?.Locations[0]?.ManagedFolderID ?? -1 },
    )?.Name ?? '<Unknown>';

    return (
      <div
        className="truncate"
        data-tooltip-id="tooltip"
        data-tooltip-content={managedFolder}
        data-tooltip-delay-show={500}
      >
        {managedFolder}
      </div>
    );
  },
});

export const fileNameColumn: UtilityHeaderType<FileType> = {
  id: 'filename',
  name: 'Filename',
  className: 'line-clamp-2 grow basis-0 overflow-hidden',
  item: (file) => {
    const path = file.Locations[0]?.RelativePath ?? '';
    const { fileName, relativePath } = extractFileNameFromPath(path);
    return (
      <div
        className="flex flex-col"
        data-tooltip-id="tooltip"
        data-tooltip-content={path}
        data-tooltip-delay-show={500}
      >
        <span className="line-clamp-1 text-sm font-semibold opacity-65">
          {relativePath}
        </span>
        <span className="line-clamp-1">
          {fileName}
        </span>
      </div>
    );
  },
};

export const staticColumns: UtilityHeaderType<FileType>[] = [
  fileNameColumn,
  {
    id: 'crc32',
    name: 'CRC32',
    className: 'w-32',
    item: file => file.Hashes.find(hash => hash.Type === 'CRC32')?.Value,
  },
  {
    id: 'size',
    name: 'Size',
    className: 'w-24',
    item: file => prettyBytes(file.Size, { binary: true }),
  },
  {
    id: 'created',
    name: 'Created',
    className: 'w-60',
    item: file => dayjs(file.Created).format('MMMM DD YYYY, HH:mm'),
  },
];
