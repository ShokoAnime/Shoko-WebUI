export type RecentFileDetailsType = {
  SeriesName: string;
  EpisodeNumber: number;
  EpisodeName: string;
  EpisodeType: string;
  Source: string;
  AudioLanguages: Array<string>;
  SubtitleLanguages: Array<string>;
  ReleaseGroup: string;
  VideoCodec: string;
};

type RecentFileLocationsType = {
  ImportFolderID: number;
  RelativePath: string;
  Accessible: boolean;
};

export type RecentFileType = {
  SeriesIDs: Array<any>;
  ID: number;
  Size: number;
  Hashes: any;
  Locations: Array<RecentFileLocationsType>;
  RoundedStandardResolution: string;
  Created: string;
};
