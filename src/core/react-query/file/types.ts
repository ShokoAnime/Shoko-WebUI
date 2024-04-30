export type DeleteFileLinkRequestType = {
  fileId: number;
  removeFolder: boolean;
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
