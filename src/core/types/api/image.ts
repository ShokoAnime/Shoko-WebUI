import type { ImageEntityType } from './common';

export type RandomImageMetadataResultType = {
  Source: string;
  Type: ImageEntityType;
  UID: string;
  Available: boolean;
  Preferred: boolean;
  Width?: number;
  Height?: number;
  Disabled: boolean;
  Series: {
    ID: number;
    Name: string;
  };
};

export type ImageTabType = 'Posters' | 'Backdrops' | 'Logos';
