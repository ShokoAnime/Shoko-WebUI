import type { FileType, ReleaseInfoType } from '@/core/types/api/file';

export enum LinkState {
  PreInit = 'pre-init',
  Init = 'init',
  Searching = 'searching',
  Ready = 'ready',
  Submitting = 'submitting',
  Submitted = 'submitted',
}

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
  state: LinkState;
};
