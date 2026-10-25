import type { AniDBEpisodeType, EpisodeTypeValues } from '@/core/types/api/episode';
import type { FileType, ReleaseCrossReferenceType, ReleaseInfoType } from '@/core/types/api/file';

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
  /**
   * The part of each episode a file covers, by link ID and then episode ID: set by hand for a single file, or split
   * evenly between several files in part order. An episode without one is covered in full.
   */
  percentageRanges: Record<
    number,
    Record<number, Pick<ReleaseCrossReferenceType, 'PercentageEnd' | 'PercentageStart'>>
  >;
};

export type TouchableField =
  | 'Comment'
  | 'CrossReferences'
  | 'Group'
  | 'IsChaptered'
  | 'IsCensored'
  | 'IsCreditless'
  | 'Source'
  | 'Version';
