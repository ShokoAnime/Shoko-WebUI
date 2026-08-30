import type { AniDBEpisodeType, EpisodeTypeValues } from '@/core/types/api/episode';
import type { FileType, ReleaseInfoType } from '@/core/types/api/file';

export type LinkStateType = 'init' | 'searching' | 'ready' | 'submitting' | 'submitted' | 'fetching';

export type ManualLinkProviderType = {
  id: string;
  enabled: boolean;
};

export type ManualLinkType = {
  id: number;
  file: FileType;
  providers: ManualLinkProviderType[];
  release: ReleaseInfoType;
  metadata?: string;
  state: LinkStateType;
};

export type RangeFillType = {
  episodeType: EpisodeTypeValues;
  rangeStart: number;
};

export type CrossReferenceType = {
  seriesId: number;
  /**
   * Row 1 may hold a sentinel (AUTO_MATCH/RANGE_FILL) or a concrete ID; rows 2+ are concrete IDs
   * (0 = unfilled). Auto-match/range fill never coexist with extra rows.
   */
  episodeIds: number[];
  episodes: AniDBEpisodeType[];
  rangeFill?: RangeFillType;
};

export type TouchableField =
  | 'Comment'
  | 'CrossReferences'
  | 'Group'
  | 'IsChaptered'
  | 'IsCreditless'
  | 'Source'
  | 'Version';
