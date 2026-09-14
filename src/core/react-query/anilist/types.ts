import type { PaginationType } from '@/core/types/api';

export type AnilistSeriesRefreshRequestType = {
  Force?: boolean;
  DownloadImages?: boolean;
  /** `null` follows the settings. */
  DownloadCharactersAndStaff?: boolean | null;
  Immediate?: boolean;
  /** Fetch only the anime and its episodes, skipping images, characters and staff. */
  QuickRefresh?: boolean;
};

export type AnilistRefreshRequestType = {
  anilistId: number;
} & AnilistSeriesRefreshRequestType;

export type AnilistAddLinkRequestType = {
  ID: number;
  Replace?: boolean;
  Refresh?: boolean;
};

export type AnilistDeleteLinkRequestType = {
  ID?: number;
  Purge?: boolean;
};

export type AnilistAddAutoXrefsRequestType = {
  AnilistAnimeID?: number;
  KeepExisting?: boolean;
  ConsiderExistingOtherLinks?: boolean | null;
};

export type AnilistAutoXrefsPreviewRequestType = {
  anilistAnimeID?: number;
  keepExisting?: boolean;
  considerExistingOtherLinks?: boolean | null;
} & PaginationType;

export type AnilistEpisodeXrefMappingRequestType = {
  AniDBID: number;
  AnilistID: number;
  Replace?: boolean;
  Index?: number | null;
};

export type AnilistEditEpisodeXrefsRequestType = {
  UnsetAll?: boolean;
  Mapping: AnilistEpisodeXrefMappingRequestType[];
};

export type AnilistSearchRequestType = {
  includeRestricted?: boolean;
} & PaginationType;

export type AnilistAnimeIncludeValues =
  | 'Synonyms'
  | 'Titles'
  | 'Overviews'
  | 'Images'
  | 'MalIDs'
  | 'Tags'
  | 'Studios'
  | 'CrossReferences';

export type AnilistEpisodeIncludeValues = 'CrossReferences';

export type AnilistAnimeListRequestType = {
  search?: string;
  fuzzy?: boolean;
  include?: AnilistAnimeIncludeValues[];
  restricted?: 'True' | 'False' | 'Only';
} & PaginationType;

export type AnilistAnimeRequestType = {
  include?: AnilistAnimeIncludeValues[];
};

export type AnilistAnimeEpisodesRequestType = {
  include?: AnilistEpisodeIncludeValues[];
} & PaginationType;

export type AnilistExportRequestType = {
  AnidbEpisodeID?: number | null;
  AnidbAnimeID?: number | null;
  AnilistAnimeID?: number | null;
  AnilistEpisodeID?: number | null;
  Automatic?: 'True' | 'False' | 'Only';
  WithEpisodes?: 'True' | 'False' | 'Only';
  IncludeComments?: boolean;
  SectionSet?: ('Anime' | 'Episode')[] | null;
};

export type AnilistImportRequestType = {
  file: File;
  removeExisting?: boolean;
  addMissingAnime?: boolean;
};
