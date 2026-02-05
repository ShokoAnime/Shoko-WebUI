import { EpisodeTypeEnum } from '@/core/types/api/episode';

export const getEpisodePrefix = (type?: EpisodeTypeEnum) => {
  switch (type) {
    case EpisodeTypeEnum.Special:
      return 'S';
    case EpisodeTypeEnum.Credits:
      return 'C';
    case EpisodeTypeEnum.Trailer:
      return 'T';
    case EpisodeTypeEnum.Other:
      return 'O';
    case EpisodeTypeEnum.Parody:
      return 'P';
    case EpisodeTypeEnum.Episode:
    default:
      return '';
  }
};

export const getEpisodePrefixAlt = (type?: EpisodeTypeEnum) => {
  switch (type) {
    case EpisodeTypeEnum.Special:
      return 'SP';
    case EpisodeTypeEnum.Credits:
      return 'C';
    case EpisodeTypeEnum.Trailer:
      return 'T';
    case EpisodeTypeEnum.Other:
      return 'O';
    case EpisodeTypeEnum.Parody:
      return 'P';
    case EpisodeTypeEnum.Episode:
    default:
      return 'EP';
  }
};
