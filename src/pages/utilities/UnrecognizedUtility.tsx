import React from 'react';
import { Outlet } from 'react-router';
import prettyBytes from 'pretty-bytes';

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
    className: 'line-clamp-1 grow basis-0 overflow-hidden break-all',
    item: (file) => {
      const fileName = file.Locations[0]?.RelativePath.split(/[/\\]/g).pop();
      return <div title={fileName}>{fileName}</div>;
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

function UnrecognizedUtility() {
  return <Outlet />;
}

export default UnrecognizedUtility;
