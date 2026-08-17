import type { EpisodeTypeValues } from '@/core/types/api/episode';

export type EpisodeCoverageType = {
  Type: EpisodeTypeValues;
  Number: number;
  GroupShortName?: string;
  /** PlaceIDs of every file covering this episode. Only populated on candidate-level `Episodes`; always empty on a file's own `Episodes`. More than one entry means multiple files legitimately cover this episode. */
  PlaceIDs: number[];
};

export type ReleaseCandidateFileType = {
  PlaceID: number;
  VideoLocalID: number;
  AbsolutePath?: string;
  FileSize: number;
  Version: number;
  IsVariation: boolean;
  IsRedundant: boolean;
  /** Release date reported by the release provider (`DateOnly`, e.g. "2024-01-05"), if known. */
  ReleasedAt?: string;
  /** When this file was imported into Shoko's library, if known. */
  ImportedAt?: string;
  /** The release's original filename as reported by the provider, if known. */
  OriginalFilename?: string;
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
  /** Release date reported by the release provider (`DateOnly`, e.g. "2024-01-05"), if known. */
  ReleasedAt?: string;
  /** When this file was imported into Shoko's library, if known. */
  ImportedAt?: string;
  /** The release's original filename as reported by the provider, if known. */
  OriginalFilename?: string;
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
