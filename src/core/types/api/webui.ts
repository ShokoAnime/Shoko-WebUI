import { RatingType } from './common';

export type WebuiGroupExtraTag = {
  Name: string;
  Description: string | null;
  Weight: number;
};

export type WebuiGroupExtra = {
  ID: number;
  Type: string;
  Rating: RatingType;
  AirDate: string | null;
  EndDate: string | null;
  Tags: Array<WebuiGroupExtraTag>;
};