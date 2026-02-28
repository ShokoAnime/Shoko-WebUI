import type { ImagesType } from './common';
import type { SeriesSizesType } from './series';

export type CollectionGroupType = {
  IDs: {
    DefaultSeries: number | null;
    ParentGroup: number | null;
    TopLevelGroup: number;
    ID: number;
    MainSeries: number;
  };
  SortName: string | null;
  Description: string | null;
  HasCustomName: boolean;
  HasCustomDescription: boolean;
  Images: ImagesType;
  Name: string;
  Size: number;
  Sizes: GroupSizesType;
};

export type GroupSizesType = SeriesSizesType & {
  SeriesTypes: GroupSizesSeriesTypesType;
  SubGroups: number;
};

export type GroupSizesSeriesTypesType = {
  Unknown: number;
  Other: number;
  TV: number;
  TVSpecial: number;
  Web: number;
  Movie: number;
  OVA: number;
};
