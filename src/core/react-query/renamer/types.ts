export type RelocationSummaryResponseType = {
  RenameOnImport: boolean;
  MoveOnImport: boolean;
  AllowRelocationInsideDestinationOnImport: boolean;
  ProviderCount: number;
};

export type RelocationSettingsRequestType = {
  RenameOnImport?: boolean;
  MoveOnImport?: boolean;
  AllowRelocationInsideDestinationOnImport?: boolean;
};

export type BaseRelocateFilesRequestType = {
  fileIDs: number[];
  move?: boolean;
  rename?: boolean;
};

export type CreateRelocationPipeRequestType = {
  providerId: string;
  name: string;
  isDefault?: boolean;
  configuration?: unknown;
};

export type ModifyRelocationPipeRequestType = {
  pipeId: string;
  name?: string;
  isDefault?: boolean;
};

export type PreviewRelocateFilesRequestType = BaseRelocateFilesRequestType & {
  providerId: string;
  configuration: unknown;
};

export type RelocateFilesRequestType = BaseRelocateFilesRequestType & {
  pipeId: string;
  deleteEmptyDirectories?: boolean;
};
