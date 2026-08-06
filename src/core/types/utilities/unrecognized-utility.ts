import type { FileType, ReleaseInfoType } from '@/core/types/api/file';

export type LinkStateType = 'pre-init' | 'init' | 'searching' | 'ready' | 'submitting' | 'submitted' | 'linked';

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
