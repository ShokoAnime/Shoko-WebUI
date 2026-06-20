export type EpisodeCoverageType = {
  Type: string;
  Number: number;
};

export type ReleaseCandidateFileType = {
  PlaceID: number;
  VideoLocalID: number;
  AbsolutePath: string | null;
  FileSize: number;
  IsRedundant: boolean;
  IsChaptered: boolean | null;
  IsCensored: boolean | null;
  IsCreditless: boolean | null;
  IsCorrupted: boolean;
  Episodes: EpisodeCoverageType[];
};

export type OverrideFileType = {
  PlaceID: number;
  VideoLocalID: number;
  AbsolutePath: string | null;
  FileSize: number;
  Version: number;
  IsChaptered: boolean | null;
  Episodes: EpisodeCoverageType[];
};

export type ReleaseOverrideType = {
  Name: string;
  GroupID: string | null;
  GroupName: string | null;
  GroupShortName: string | null;
  Source: string | null;
  Resolution: string | null;
  VideoCodec: string | null;
  BitDepth: number;
  AudioCodec: string | null;
  AudioStreamCount: number;
  SubtitleStreamCount: number;
  AudioLanguages: string[] | null;
  SubtitleLanguages: string[] | null;
  HasPartialCoverage: boolean;
  Files: OverrideFileType[];
};

export type ReleaseCandidateType = {
  Name: string;
  Rank: number;
  Key: string;
  HasReleaseInfo: boolean;
  IsRedundant: boolean;
  IsPartial?: boolean;
  DecidingSignal?: string;
  WinnerValue?: string;
  LoserValue?: string;
  GroupID: string | null;
  GroupName: string | null;
  GroupShortName: string | null;
  Source: string | null;
  Resolution: string | null;
  VideoCodec: string | null;
  BitDepth: number;
  AudioCodec: string | null;
  AudioStreamCount: number;
  SubtitleStreamCount: number;
  IsChaptered: boolean | null;
  IsChapteredMixed: boolean;
  IsCensored: boolean | null;
  IsCensoredMixed: boolean;
  IsCreditless: boolean | null;
  IsCreditlessMixed: boolean;
  IsCorrupted: boolean;
  Version: number;
  VersionStrategy: 'BestAvailable' | 'Consistent';
  IsMixed: boolean;
  IsHomogeneous: boolean;
  SecondaryGroupNames: string[] | null;
  AudioLanguages: string[] | null;
  SubtitleLanguages: string[] | null;
  Files: ReleaseCandidateFileType[];
  Episodes: EpisodeCoverageType[];
};

export type SeriesWithCandidatesType = {
  SeriesID: number;
  SeriesTitle: string;
  AnidbAnimeID: number;
  IsAiring: boolean;
  HasRedundantCandidates: boolean;
  Candidates: ReleaseCandidateType[];
  Overrides: ReleaseOverrideType[];
};

export type ReleaseDeletionPreviewFileType = {
  PlaceID: number;
  VideoLocalID: number;
  AbsolutePath: string | null;
  FileSize: number;
};

export type ReleaseDeletionPreviewType = {
  SeriesID: number;
  SeriesTitle: string;
  AnidbAnimeID: number;
  TotalFilesToDelete: number;
  TotalSizeToDelete: number;
  Files: ReleaseDeletionPreviewFileType[];
};
