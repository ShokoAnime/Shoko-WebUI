export type SignalRQueueType = {
  state: number;
  description: string;
  status: string;
  currentCommandID: number | null;
  queueCount: number;
};

export type QueueStatusType = {
  HasherQueueState: SignalRQueueType;
  GeneralQueueState: SignalRQueueType;
  ImageQueueState: SignalRQueueType;
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
