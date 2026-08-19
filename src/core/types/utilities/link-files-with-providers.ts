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
  episodeId: number;
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
