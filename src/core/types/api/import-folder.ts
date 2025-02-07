export type ImportFolderType = {
  ID: number;
  WatchForNewFiles?: boolean;
  DropFolderType?: 'Excluded' | 'Source' | 'Destination' | 'Both';
  Path: string;
  Name: string;
  Size?: number;
  FileSize?: number;
};
