export type DeleteManagedFolderRequestType = {
  folderId: number;
  /** When false, file records are left intact. Use when files are being migrated to a new location. */
  removeRecords?: boolean;
  /** When true, removed files are not synced to providers, i.e. they are left in your AniDB MyList. */
  skipEvents?: boolean;
};
