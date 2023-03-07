import { ImageType, RatingType } from './common';
import { CollectionFilterType } from './collection';

export type WebuiGroupExtraTag = {
  ID: number;
  Name: string;
  Weight: number;
  Source: 'AniDB' | 'User';
};

export type WebuiGroupExtra = {
  ID: number;
  Type: string;
  Rating: RatingType;
  AirDate: string | null;
  EndDate: string | null;
  Tags: Array<WebuiGroupExtraTag>;
};

export type WebuiSeriesRolePerson = {
  Name:	string;
  AlternateName: string | null;
  Description: string | null;
  Image: ImageType;
};

export type WebuiSeriesDetailsType = {
  FirstAirSeason: CollectionFilterType;
  Studios: WebuiSeriesRolePerson[];
  Producers: WebuiSeriesRolePerson[];
  SourceMaterial: string | null;
};