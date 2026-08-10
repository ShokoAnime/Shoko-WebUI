// The server's catalog (`GET Filter/Expressions`) has ~200 expression types and is the
// actual source of truth at runtime - a hardcoded union here can't be kept in sync with it.
export type ExpressionType = string;

type SortingType =
  | 'AddedDate'
  | 'AirDate'
  | 'AudioLanguageCount'
  | 'AverageAniDBRating'
  | 'EpisodeCount'
  | 'FuzzyNameRelevance'
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
  Parameter?: string;
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

// Editable UI representation of a FilterCondition tree. Leaves reuse the existing
// widget kinds (boolean/multi/multiPair/tag); anything else (Function calls, comparison
// operators over selectors) is preserved verbatim as an UnsupportedNode rather than
// dropped or partially interpreted.
export type LeafValue =
  | { kind: 'boolean', value: boolean }
  | { kind: 'multi', values: string[], match: 'And' | 'Or' }
  | { kind: 'multiPair', values: [string, string][], match: 'And' | 'Or' }
  | { kind: 'tag', tags: FilterTag[] };

export type LeafNode = {
  id: string;
  kind: 'leaf';
  expression: string;
  negate: boolean;
  value: LeafValue;
};

export type GroupNode = {
  id: string;
  kind: 'group';
  operator: 'And' | 'Or';
  negate: boolean;
  children: TreeNode[];
};

export type UnsupportedNode = {
  id: string;
  kind: 'unsupported';
  raw: FilterCondition;
};

export type TreeNode = LeafNode | GroupNode | UnsupportedNode;
