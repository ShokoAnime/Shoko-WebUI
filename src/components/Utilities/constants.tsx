import React from 'react';
import prettyBytes from 'pretty-bytes';

import { FileSortCriteriaEnum } from '@/core/types/api/file';
import { dayjs } from '@/core/util';

import type { EpisodeType } from '@/core/types/api/episode';
import type { FileType } from '@/core/types/api/file';
import type { ReleaseManagementSeriesType, SeriesType } from '@/core/types/api/series';

export type UtilityHeaderType<T extends EpisodeType | FileType | SeriesType | ReleaseManagementSeriesType> = {
  id: string;
  name: string;
  className: string;
  item: (_: T) => React.ReactNode;
};

export type ReleaseManagementOptionsType = Record<number, 'keep' | 'variation' | 'delete'>;

export const criteriaMap = {
  importFolder: FileSortCriteriaEnum.ImportFolderName,
  filename: FileSortCriteriaEnum.FileName,
  crc32: FileSortCriteriaEnum.CRC32,
  size: FileSortCriteriaEnum.FileSize,
  created: FileSortCriteriaEnum.CreatedAt,
  status: null,
};

export const staticColumns: UtilityHeaderType<FileType>[] = [
  {
    id: 'filename',
    name: 'Filename',
    className: 'line-clamp-2 grow basis-0 overflow-hidden',
    item: (file) => {
      const path = file.Locations[0]?.RelativePath ?? '';
      const match = /[/\\](?=[^/\\]*$)/g.exec(path);
      const relativePath = match ? path?.substring(0, match.index) : 'Root Level';
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
            {path?.split(/[/\\]/g).pop()}
          </span>
        </div>
      );
    },
  },
  {
    id: 'crc32',
    name: 'CRC32',
    className: 'w-32',
    item: file => file.Hashes.CRC32,
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
