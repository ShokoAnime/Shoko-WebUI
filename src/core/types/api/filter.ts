type ExpressionType =
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
  | 'StringStartsWith';

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
  Expression: string;
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
};

export type FilterTag = {
  Name: string;
  isExcluded: boolean;
};

export type FilterSeason = {
  Year: string;
  Season: string;
};

export type SortingCriteria = {
  Type: SortingType;
  Next?: SortingCriteria;
  IsInverted: boolean;
};

export type FilterType = {
  Name?: string;
  ParentID?: number;
  IsDirectory?: boolean;
  IsHidden?: boolean;
  ApplyAtSeriesLevel?: boolean;
  Expression?: FilterCondition;
  Sorting?: SortingCriteria;
};
