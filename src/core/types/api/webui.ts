import { RatingType } from './common';

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