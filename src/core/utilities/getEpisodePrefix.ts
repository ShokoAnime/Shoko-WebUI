import type { EpisodeTypeValues } from '@/core/types/api/episode';

export const getEpisodePrefix = (type?: EpisodeTypeValues) => {
  switch (type) {
    case 'Special':
      return 'S';
    case 'Credits':
      return 'C';
    case 'Trailer':
      return 'T';
    case 'Other':
      return 'O';
    case 'Parody':
      return 'P';
    case 'Episode':
    default:
      return '';
  }
};

export const getEpisodePrefixAlt = (type?: EpisodeTypeValues) => {
  switch (type) {
    case 'Special':
      return 'SP';
    case 'Credits':
      return 'C';
    case 'Trailer':
      return 'T';
    case 'Other':
      return 'O';
    case 'Parody':
      return 'P';
    case 'Episode':
    default:
      return 'EP';
  }
};
