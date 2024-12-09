export type DeleteFilesRequestType = {
  fileIds: number[];
  removeFolder: boolean;
};

export type DeleteFileRequestType = {
  fileId: number;
  removeFolder: boolean;
};

export type DeleteFileLocationRequestType = {
  locationId: number;
  deleteFile?: boolean;
  deleteFolder?: boolean;
};

export type IgnoreFileRequestType = {
  fileId: number;
  ignore: boolean;
};

export type LinkOneFileToManyEpisodesRequestType = {
  episodeIDs: number[];
  fileId: number;
};

export type LinkManyFilesToOneEpisodeRequestType = {
  episodeID: number;
  fileIDs: number[];
};

export type MarkVariationRequestType = {
  fileId: number;
  variation: boolean;
};
