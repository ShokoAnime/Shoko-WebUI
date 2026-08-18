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
  UpdateType: BanUpdateTypeValues;
  Value: boolean;
};

export type BanUpdateTypeValues =
  | 'None'
  | 'UDPBan'
  | 'HTTPBan'
  | 'InvalidSession'
  | 'OverloadBackoff'
  | 'WaitingOnResponse'
  | 'LoginFailed';

export type NetworkAvailabilityValues =
  | 'NoInterfaces'
  | 'NoGateways'
  | 'LocalOnly'
  | 'PartialInternet'
  | 'Internet';

export type AVDumpRestoreType = {
  Type: 'Restore';
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
  Type: 'Started';
  SessionID: number;
  VideoIDs: number[];
  CommandID: number | null;
  Progress: number;
  SucceededCreqCount: number;
  FailedCreqCount: number;
  PendingCreqCount: number;
  StartedAt: string;
} | {
  Type: 'Progress';
  SessionID: number;
  Progress: number;
} | {
  Type: 'CreqUpdate';
  SessionID: number;
  SucceededCreqCount: number;
  FailedCreqCount: number;
  PendingCreqCount: number;
} | {
  Type: 'Message' | 'Error' | 'ED2KLink';
  SessionID: number;
  Message: string;
} | {
  Type:
    | 'InstalledAVDump'
    | 'InstallingAVDump'
    | 'InvalidCredentials'
    | 'MissingApiKey'
    | 'Timeout';
} | {
  Type: 'InstallException';
  Message: string;
  ExceptionStackTrace: string;
} | {
  Type: 'GenericException';
  SessionID: number;
  Message: string;
  ExceptionStackTrace: string;
  StartedAt: string;
} | {
  Type: 'Failure';
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
  Type: 'Success';
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

export type SeriesUpdateEventType = {
  ShokoSeriesIDs: number[];
};

export type RestartRequiredType = {
  RequiresRestart: boolean;
};
