export type FolderType = {
  Type?: 'Fixed' | 'Ram' | 'Network';
  Path: string;
  IsAccessible: boolean;
  Sizes: {
    Files: number;
    Folders: number;
  };
  nodeId: number;
};
