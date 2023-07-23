export type QueueItemType = {
  state: number;
  description: string;
  status: string;
  currentCommandID: number | null;
  queueCount: number;
};

export type QueueStatusType = {
  HasherQueueState: QueueItemType;
  GeneralQueueState: QueueItemType;
  ImageQueueState: QueueItemType;
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
