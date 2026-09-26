import type { ImageEntityValues } from '@/core/types/api/common';

export const imageEntityLabels: Record<ImageEntityValues, string> = {
  None: 'Image',
  Primary: 'Poster',
  Backdrop: 'Backdrop',
  Banner: 'Banner',
  Logo: 'Logo',
  Disc: 'Disc',
};
