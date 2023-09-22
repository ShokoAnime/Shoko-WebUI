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

export const enum QueueNameType {
  'HasherQueueState' = 'HasherQueueState',
  'GeneralQueueState' = 'GeneralQueueState',
  'ImageQueueState' = 'ImageQueueState',
}

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

export type AVDumpRestoreType = {
  type: AVDumpEventTypeEnum.Restore;
  sessionID: number;
  videoIDs: number[];
  commandID: number | null;
  progress: number;
  succeededCreqCount: number;
  failedCreqCount: number;
  pendingCreqCount: number;
  ed2ks: number[];
  startedAt: string;
};

export type AVDumpEventType = {
  type: AVDumpEventTypeEnum.Started;
  sessionID: number;
  videoIDs: number[];
  commandID: number | null;
  progress: number;
  succeededCreqCount: number;
  failedCreqCount: number;
  pendingCreqCount: number;
  startedAt: string;
} | {
  type: AVDumpEventTypeEnum.Progress;
  sessionID: number;
  progress: number;
} | {
  type: AVDumpEventTypeEnum.CreqUpdate;
  sessionID: number;
  succeededCreqCount: number;
  failedCreqCount: number;
  pendingCreqCount: number;
} | {
  type: AVDumpEventTypeEnum.Message | AVDumpEventTypeEnum.Error | AVDumpEventTypeEnum.ED2KLink;
  sessionID: number;
  message: string;
} | {
  type:
    | AVDumpEventTypeEnum.InstalledAVDump
    | AVDumpEventTypeEnum.InstallingAVDump
    | AVDumpEventTypeEnum.InvalidCredentials
    | AVDumpEventTypeEnum.MissingApiKey
    | AVDumpEventTypeEnum.Timeout;
} | {
  type: AVDumpEventTypeEnum.InstallException;
  message: string;
  exceptionStackTrace: string;
} | {
  type: AVDumpEventTypeEnum.GenericException;
  sessionID: number;
  message: string;
  exceptionStackTrace: string;
  startedAt: string;
} | {
  type: AVDumpEventTypeEnum.Failure;
  sessionID: number;
  videoIDs: number[];
  commandID: number | null;
  progress: number;
  ed2ks: number[];
  message: string;
  errorMessage?: string;
  startedAt: string;
  endedAt: string;
} | {
  type: AVDumpEventTypeEnum.Success;
  sessionID: number;
  videoIDs: number[];
  commandID: number | null;
  progress: number;
  succeededCreqCount: number;
  failedCreqCount: number;
  pendingCreqCount: number;
  message: string;
  startedAt: string;
  endedAt: string;
};

export const enum AVDumpEventTypeEnum {
  Message = 'Message',
  Error = 'Error',
  Progress = 'Progress',
  CreqUpdate = 'CreqUpdate',
  ED2KLink = 'ED2KLink',
  Started = 'Started',
  Success = 'Success',
  Failure = 'Failure',
  Restore = 'Restore',
  GenericException = 'GenericException',
  MissingApiKey = 'MissingApiKey',
  InvalidCredentials = 'InvalidCredentials',
  Timeout = 'Timeout',
  InstallingAVDump = 'InstallingAVDump',
  InstalledAVDump = 'InstalledAVDump',
  InstallException = 'InstallException',
}
