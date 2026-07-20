import type { EpisodeTypeEnum } from '@/core/types/api/episode';

export type EpisodeCoverageType = {
  Type: EpisodeTypeEnum;
  Number: number;
  GroupShortName?: string;
};

export type ReleaseCandidateFileType = {
  PlaceID: number;
  VideoLocalID: number;
  AbsolutePath?: string;
  FileSize: number;
  Version: number;
  IsRedundant: boolean;
  IsChaptered?: boolean;
  IsCensored?: boolean;
  IsCreditless?: boolean;
  IsCorrupted: boolean;
  Source?: string;
  Resolution?: string;
  VideoCodec?: string;
  BitDepth: number;
  AudioCodec?: string;
  AudioStreamCount: number;
  SubtitleStreamCount: number;
  AudioLanguages: string[];
  SubtitleLanguages: string[];
  Episodes: EpisodeCoverageType[];
};

export type OverrideFileType = {
  PlaceID: number;
  VideoLocalID: number;
  AbsolutePath?: string;
  FileSize: number;
  Version: number;
  IsChaptered?: boolean;
  Episodes: EpisodeCoverageType[];
};

export type ReleaseOverrideType = {
  Name: string;
  GroupID?: string;
  GroupName?: string;
  GroupShortName?: string;
  Source?: string;
  Resolution?: string;
  VideoCodec?: string;
  BitDepth: number;
  AudioCodec?: string;
  AudioStreamCount: number;
  SubtitleStreamCount: number;
  AudioLanguages?: string[];
  SubtitleLanguages?: string[];
  HasPartialCoverage: boolean;
  Files: OverrideFileType[];
};

export type ReleaseCandidateType = {
  Name: string;
  Rank: number;
  Key: string;
  HasReleaseInfo: boolean;
  IsRedundant: boolean;
  RedundantFileCount: number;
  RedundantEpisodes: EpisodeCoverageType[];
  IsPartial?: boolean;
  DecidingSignal?: string;
  DecidingType?: string;
  WinnerValue?: string;
  LoserValue?: string;
  GroupID?: string;
  GroupName?: string;
  GroupShortName?: string;
  Source?: string;
  Resolution?: string;
  VideoCodec?: string;
  BitDepth: number;
  AudioCodec?: string;
  AudioStreamCount: number;
  SubtitleStreamCount: number;
  IsChaptered?: boolean;
  IsChapteredMixed: boolean;
  IsCensored?: boolean;
  IsCensoredMixed: boolean;
  IsCreditless?: boolean;
  IsCreditlessMixed: boolean;
  IsCorrupted: boolean;
  Version: number;
  VersionStrategy: 'BestAvailable' | 'Consistent';
  IsMixed: boolean;
  IsHomogeneous: boolean;
  SecondaryGroupNames?: string[];
  AudioLanguages?: string[];
  SubtitleLanguages?: string[];
  Files: ReleaseCandidateFileType[];
  Episodes: EpisodeCoverageType[];
};

export type SeriesWithCandidatesType = {
  SeriesID: number;
  SeriesTitle: string;
  AnidbAnimeID: number;
  IsAiring: boolean;
  HasRedundantCandidates: boolean;
  FilesToAutoDeleteCount: number;
  Candidates: ReleaseCandidateType[];
  Overrides: ReleaseOverrideType[];
};

export type ReleaseDeletionPreviewFileType = {
  PlaceID: number;
  VideoLocalID: number;
  AbsolutePath?: string;
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
