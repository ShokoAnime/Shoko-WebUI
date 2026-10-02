export type TmdbEpisodeType = {
  ID: number;
  SeasonID: string;
  ShowID: number;
  Title: string;
  Overview: string;
  EpisodeNumber: number;
  SeasonNumber: number;
  AiredAt: string;
};

export type TmdbBaseItemType = {
  ID: number;
  Title: string;
  Overview: string;
  ReleasedAt: string;
};

export type TmdbMovieType = TmdbBaseItemType;

export type TmdbShowType = TmdbBaseItemType;
