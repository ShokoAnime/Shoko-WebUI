export type ManagedFolderType = {
  ID: number;
  WatchForNewFiles?: boolean;
  DropFolderType?: 'None' | 'Source' | 'Destination' | 'Both';
  Path: string;
  Name: string;
  Size?: number;
  FileSize?: number;
};
