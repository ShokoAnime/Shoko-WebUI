import { ImagesType, SizesType } from './common';

export type CollectionGroupType = {
  IDs: {
    DefaultSeries: number | null,
    ParentGroup: number | null,
    TopLevelGroup: number,
    ID: number,
  }
  SortName: string | null;
  Description: string | null;
  HasCustomName: boolean;
  Images: ImagesType;
  Name: string;
  Size: number;
  Sizes:  SizesType;
};