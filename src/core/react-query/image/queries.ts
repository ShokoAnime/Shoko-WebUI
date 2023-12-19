import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { ImageTypeEnum } from '@/core/types/api/common';
import type { RandomImageMetadataResultType } from '@/core/types/api/image';

export const useRandomImageMetadataQuery = (imageType: ImageTypeEnum) =>
  useQuery<RandomImageMetadataResultType>({
    queryKey: ['image', 'random', imageType],
    queryFn: () => axios.get(`Image/Random/${imageType}/Metadata`),
  });
