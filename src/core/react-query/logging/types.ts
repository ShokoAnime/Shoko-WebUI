// Mirrors Microsoft.Extensions.Logging.LogLevel as serialized by the server (StringEnumConverter).
export type LogLevelType = 'Trace' | 'Debug' | 'Information' | 'Warning' | 'Error' | 'Critical' | 'None';

export type LogEventType = {
  TimeStamp: string;
  Level: LogLevelType;
  ThreadID?: number;
  ProcessID?: number;
  Logger?: string;
  Caller?: string;
  Message: string;
  Exception?: string;
};

export type LogReadResultType = {
  NextOffset: number | null;
  Entries: LogEventType[];
};

export type LogsSearchParamsType = {
  search: string;
  levels: Set<LogLevelType>;
};
