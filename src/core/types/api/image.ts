import type { ImageTypeEnum } from '@/core/types/api/common';

export type RandomImageMetadataResultType = {
  Source: string;
  Type: ImageTypeEnum;
  ID: string;
  RelativeFilepath: string;
  Preferred: boolean;
  Width: number | null;
  Height: number | null;
  Disabled: boolean;
  Series: {
    ID: number;
    Name: string;
  };
};
