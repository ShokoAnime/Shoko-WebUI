export type QueueItemType = {
  Key: string;
  Type: string;
  Description: string;
  IsRunning: boolean;
  StartTime?: string;
  IsBlocked: boolean;
  Title: string;
  Details: Record<string, string>;
};

export type QueueStatusType = {
  WaitingCount: number;
  BlockedCount: number;
  TotalCount: number;
  ThreadCount: number;
  CurrentlyExecuting: QueueItemType[];
  Running: boolean;
};

export type AniDBBanItemType = {
  Message: string;
  PauseTimeSecs: number;
  UpdateTime: string;
  UpdateType: AniDBBanTypeEnum;
  Value: boolean;
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

export const enum NetworkAvailabilityEnum {
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
  Type: AVDumpEventTypeEnum.Restore;
  SessionID: number;
  VideoIDs: number[];
  CommandID: number | null;
  Progress: number;
  SucceededCreqCount: number;
  FailedCreqCount: number;
  PendingCreqCount: number;
  ED2Ks: number[];
  StartedAt: string;
};

export type AVDumpEventType = {
  Type: AVDumpEventTypeEnum.Started;
  SessionID: number;
  VideoIDs: number[];
  CommandID: number | null;
  Progress: number;
  SucceededCreqCount: number;
  FailedCreqCount: number;
  PendingCreqCount: number;
  StartedAt: string;
} | {
  Type: AVDumpEventTypeEnum.Progress;
  SessionID: number;
  Progress: number;
} | {
  Type: AVDumpEventTypeEnum.CreqUpdate;
  SessionID: number;
  SucceededCreqCount: number;
  FailedCreqCount: number;
  PendingCreqCount: number;
} | {
  Type: AVDumpEventTypeEnum.Message | AVDumpEventTypeEnum.Error | AVDumpEventTypeEnum.ED2KLink;
  SessionID: number;
  Message: string;
} | {
  Type:
    | AVDumpEventTypeEnum.InstalledAVDump
    | AVDumpEventTypeEnum.InstallingAVDump
    | AVDumpEventTypeEnum.InvalidCredentials
    | AVDumpEventTypeEnum.MissingApiKey
    | AVDumpEventTypeEnum.Timeout;
} | {
  Type: AVDumpEventTypeEnum.InstallException;
  Message: string;
  ExceptionStackTrace: string;
} | {
  Type: AVDumpEventTypeEnum.GenericException;
  SessionID: number;
  Message: string;
  ExceptionStackTrace: string;
  StartedAt: string;
} | {
  Type: AVDumpEventTypeEnum.Failure;
  SessionID: number;
  VideoIDs: number[];
  CommandID: number | null;
  Progress: number;
  ED2Ks: number[];
  Message: string;
  ErrorMessage?: string;
  StartedAt: string;
  EndedAt: string;
} | {
  Type: AVDumpEventTypeEnum.Success;
  SessionID: number;
  VideoIDs: number[];
  CommandID: number | null;
  Progress: number;
  SucceededCreqCount: number;
  FailedCreqCount: number;
  PendingCreqCount: number;
  Message: string;
  StartedAt: string;
  EndedAt: string;
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

export type SeriesUpdateEventType = {
  ShokoSeriesIDs: number[];
};
