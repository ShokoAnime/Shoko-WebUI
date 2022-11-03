export type QueueItemType = {
  state: number;
  description: string;
};

export type QueueStatusType = {
  HasherQueueState: QueueItemType;
  GeneralQueueState: QueueItemType;
  ImageQueueState: QueueItemType;
  HasherQueueCount: number;
  GeneralQueueCount: number;
  ImageQueueCount: number;
};

export type AniDBBanItemType = {
  message: string;
  pauseTimeSecs: number;
  updateTime: string;
  updateType: number;
  value: boolean;
};

export type AniDBBanType = {
  http: AniDBBanItemType;
  udp: AniDBBanItemType;
};
