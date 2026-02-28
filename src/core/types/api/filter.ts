export type ExpressionType =
  | 'And'
  | 'Not'
  | 'Or'
  | 'AniDBIDsSelector'
  | 'AllContains'
  | 'AllRegexMatches'
  | 'AnyContains'
  | 'AnyEquals'
  | 'AnyFuzzyMatches'
  | 'AnyRegexMatches'
  | 'HasUnwatchedEpisodes'
  | 'HasWatchedEpisodes'
  | 'NameSelector'
  | 'NamesSelector'
  | 'StringContains'
  | 'StringEndsWith'
  | 'StringEquals'
  | 'StringFuzzyMatches'
  | 'StringNotEquals'
  | 'StringRegexMatches'
  | 'StringStartsWith'
  | 'HasTag'
  | 'HasCustomTag';

type SortingType =
  | 'AddedDate'
  | 'AirDate'
  | 'AudioLanguageCount'
  | 'AverageAniDBRating'
  | 'EpisodeCount'
  | 'HighestAniDBRating'
  | 'HighestUserRating'
  | 'LastAddedDate'
  | 'LastAirDate'
  | 'LastWatchedDate'
  | 'LowestAniDBRating'
  | 'LowestUserRating'
  | 'MissingEpisodeCollectingCount'
  | 'MissingEpisodeCount'
  | 'Name'
  | 'SeriesCount'
  | 'SortingName'
  | 'SubtitleLanguageCount'
  | 'TotalEpisodeCount'
  | 'UnwatchedEpisodeCount'
  | 'WatchedDate'
  | 'WatchedEpisodeCount';

export type FilterCondition = {
  Type: ExpressionType;
  Left?: FilterCondition;
  Right?: FilterCondition;
  Parameter?: string;
  SecondParameter?: string;
};

export type FilterExpression = {
  Expression: ExpressionType;
  Name: string;
  Description: string;
  Group: string;
  Type: string;
  Left?: string;
  Right?: string;
  Parameter?: string;
  SecondParameter?: string;
  PossibleParameters?: string[];
  PossibleSecondParameters?: string[];
  PossibleParameterPairs?: string[][];
};

export type FilterTag = {
  Name: string;
  isExcluded: boolean;
};

export type SortingCriteria = {
  Type: SortingType;
  Next?: SortingCriteria;
  IsInverted: boolean;
};

type BaseFilterType = {
  ApplyAtSeriesLevel?: boolean;
  IsDirectory?: boolean;
  IsHidden?: boolean;
  Name?: string;
  Expression?: FilterCondition;
  Sorting?: SortingCriteria;
};

export type CreateOrUpdateFilterType = {
  ParentID?: number;
} & BaseFilterType;

export type FilterType = {
  IDs: {
    ParentFilter: number | null;
    ID: number;
  };
  IsLocked: boolean;
  Size: number;
} & BaseFilterType;
