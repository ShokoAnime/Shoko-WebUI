export type ReleaseInfoSummaryType = {
  ParallelMode: boolean;
};

export type UpdateReleaseInfoSettingsType = {
  ParallelMode?: boolean | null;
};

export type UpdateManyReleaseInfoProviderType = UpdateOneReleaseInfoProviderType & {
  ID: string;
};

export type UpdateOneReleaseInfoProviderType = {
  Priority?: number | null;
  IsEnabled?: boolean | null;
};
