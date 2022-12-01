export type DriveType = {
  DriveType: string;
  Path: string;
  CanAccess: boolean;
  Sizes: {
    Files: number;
    Folders: number;
  };
  nodeId: number; //generated clientside
};

export type FolderType = {
  Type?: 'Fixed' | 'Ram' | 'Network';
  Path: string;
  IsAccessible: boolean;
  Sizes: {
    Files: number;
    Folders: number;
  };
  nodeId: number; //generated clientside
};
