import { EpisodeTypeEnum } from '@/core/types/api/episode';

export const getEpisodePrefix = (type?: EpisodeTypeEnum) => {
  switch (type) {
    case EpisodeTypeEnum.Special:
      return 'S';
    case EpisodeTypeEnum.ThemeSong:
      return 'C';
    case EpisodeTypeEnum.Trailer:
      return 'T';
    case EpisodeTypeEnum.Other:
      return 'O';
    case EpisodeTypeEnum.Parody:
      return 'P';
    case EpisodeTypeEnum.Normal:
    default:
      return '';
  }
};

export const getEpisodePrefixAlt = (type?: EpisodeTypeEnum) => {
  switch (type) {
    case EpisodeTypeEnum.Special:
      return 'SP';
    case EpisodeTypeEnum.ThemeSong:
      return 'C';
    case EpisodeTypeEnum.Trailer:
      return 'T';
    case EpisodeTypeEnum.Other:
      return 'O';
    case EpisodeTypeEnum.Parody:
      return 'P';
    case EpisodeTypeEnum.Normal:
    default:
      return 'EP';
  }
};
