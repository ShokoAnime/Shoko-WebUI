import type React from 'react';

import type { ImageType } from '@/core/types/api/common';
import type { SeriesType } from '@/core/types/api/series';

export const posterItemSize = {
  width: 209,
  height: 363,
  gap: 16,
};

export const listItemSize = {
  width: 907,
  height: 319,
  widthAlt: 907,
  gap: 32,
};

export type SeriesContextType = {
  backdrop?: ImageType;
  scrollRef: React.RefObject<HTMLDivElement>;
  series: SeriesType;
};
