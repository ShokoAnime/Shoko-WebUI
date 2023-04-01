export type FolderType = {
  DriveType: 'Fixed' | 'Ram' | 'Network';
  Path: string;
  IsAccessible: boolean;
  Sizes: {
    Files: number;
    Folders: number;
  };
};
