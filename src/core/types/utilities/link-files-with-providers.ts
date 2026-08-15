import type { AniDBEpisodeType } from '@/core/types/api/episode';
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

export type CrossReferenceType = {
  seriesId: number;
  episodeId: number;
  episodes: AniDBEpisodeType[];
};

export type TouchableField = 'Comment' | 'CrossReferences' | 'IsChaptered' | 'IsCreditless' | 'Source' | 'Version';
