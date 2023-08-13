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

export const enum NetworkAvailability {
  /**
   * Shoko was unable to find any network interfaces.
   */
  NoInterfaces = 'NoInterfaces',

  /**
   * Shoko was unable to find any local gateways to use.
   */
  NoGateways = 'NoGateways',

  /**
   * Shoko was able to find a local gateway.
   */
  LocalOnly = 'LocalOnly',

  /**
   * Shoko was able to connect to some internet endpoints in WAN.
   */
  PartialInternet = 'PartialInternet',

  /**
   * Shoko was able to connect to all internet endpoints in WAN.
   */
  Internet = 'Internet',
}
