export type FolderType = {
  DriveType?: 'Fixed' | 'Ram' | 'Network';
  Path: string;
  CanAccess: boolean;
  Sizes: {
    Files: number;
    Folders: number;
  };
  nodeId: number;
};
