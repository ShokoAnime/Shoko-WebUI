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
  updateType: AniDBBanTypeEnum;
  value: boolean;
};

export const enum AniDBBanTypeEnum {
  None = 0,
  UDPBan = 1,
  HTTPBan = 2,
  InvalidSession = 3,
  OverloadBackoff = 4,
  WaitingOnResponse = 5,
}

export type AniDBBanType = {
  http: AniDBBanItemType;
  udp: AniDBBanItemType;
};
