export type HideEpisodeRequestType = {
  episodeId: number;
  hidden: boolean;
};

export type WatchEpisodeRequestType = {
  episodeId?: number;
  watched: boolean;
};
