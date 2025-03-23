export type HashingSummaryType = {
  ParallelMode: boolean;
};

export type UpdateHashingSettingsType = {
  ParallelMode?: boolean | null;
};

export type UpdateManyHashingProviderInfoType = UpdateOneHashingProviderInfoType & {
  ID: string;
};

export type UpdateOneHashingProviderInfoType = {
  Priority?: number | null;
  EnabledHashTypes?: string[] | null;
};
