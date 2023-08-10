export type ImportFolderType = {
  ID: number;
  WatchForNewFiles?: boolean;
  DropFolderType?: 0 | 1 | 2 | 3;
  Path: string;
  Name: string;
  Size?: number;
  FileSize?: number;
};
