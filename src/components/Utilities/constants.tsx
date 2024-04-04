import React from 'react';
import prettyBytes from 'pretty-bytes';

import { ImportFolderPath } from '@/components/Utilities/Unrecognized/ImportFolderPath';
import { FileSortCriteriaEnum } from '@/core/types/api/file';
import { dayjs } from '@/core/util';

import type { FileType } from '@/core/types/api/file';
import type { SeriesType } from '@/core/types/api/series';

export type UtilityHeaderType<T extends FileType | SeriesType> = {
  id: string;
  name: string;
  className: string;
  item: (_: T) => React.ReactNode;
};

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
    item: file => (
      <div className="flex flex-col" title={file.Locations[0]?.RelativePath.match(/[^\\/]*$/)?.[0]}>
        <span className="line-clamp-1 text-sm font-semibold opacity-65">
          <ImportFolderPath file={file} />
        </span>
        <span className="line-clamp-1">
          {file.Locations[0]?.RelativePath?.split(/[/\\]/g).pop()}
        </span>
      </div>
    ),
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
