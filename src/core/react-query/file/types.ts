export type DeleteFilesRequestType = {
  fileIds: number[];
  removeFolder: boolean;
};

export type DeleteFileRequestType = {
  fileId: number;
  removeFiles?: boolean;
  removeFolder?: boolean;
};

export type DeleteFileLocationsRequestType = {
  locationIds: number[];
  removeFiles?: boolean;
  removeFolder?: boolean;
};

export type DeleteFileLocationRequestType = {
  locationId: number;
  removeFiles?: boolean;
  removeFolder?: boolean;
};

export type IgnoreFileRequestType = {
  fileId: number;
  ignore: boolean;
};

export type MarkVariationRequestType = {
  fileId: number;
  variation: boolean;
};
