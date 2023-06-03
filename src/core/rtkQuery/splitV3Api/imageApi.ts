import { splitV3Api } from '../splitV3Api';
import { ImageTypeEnum } from '@/core/types/api/common';

type RandomMetadataResultType = {
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
  }
};

const imageApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    getRandomMetadata: build.query<RandomMetadataResultType, { imageType: ImageTypeEnum }>({
      query: ({ imageType }) => ({
        url: `Image/Random/${imageType}/Metadata`,
      }),
    }),
  }),
});

export const {
  useGetRandomMetadataQuery,
} = imageApi;