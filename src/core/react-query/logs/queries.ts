import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { HttpTransportType, HubConnectionBuilder, JsonHubProtocol, LogLevel } from '@microsoft/signalr';
import { useQuery } from '@tanstack/react-query';

import queryClient from '@/core/react-query/queryClient';
import { dayjs } from '@/core/util';

import type { RootState } from '@/core/store';
import type { LogLineType } from '@/core/types/api/common';

const logsQueryKey = ['logs'];

const formatStamp = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss');
const formatTimestamps = (lines: LogLineType[]): LogLineType[] =>
  lines.map<LogLineType>(item => ({ ...item, timeStamp: formatStamp(item.timeStamp) }));

const useLogsSubscription = () => {
  const apikey = useSelector((state: RootState) => state.apiSession.apikey);

  useEffect(() => {
    const connectionLogHub = '/signalr/logging';
    const protocol = new JsonHubProtocol();
    // eslint-disable-next-line no-bitwise
    const transport = HttpTransportType.WebSockets | HttpTransportType.LongPolling;
    const options = {
      transport,
      logMessageContent: true,
      logger: LogLevel.Warning,
      accessTokenFactory: () => apikey,
    };

    const connectionLog = new HubConnectionBuilder().withUrl(connectionLogHub, options).withHubProtocol(protocol)
      .build();

    connectionLog.on(
      'GetBacklog',
      (lines: LogLineType[]) =>
        queryClient.setQueryData(logsQueryKey, (oldData: LogLineType[] | undefined) => {
          const newData = formatTimestamps(lines);
          return oldData ? [...oldData, ...newData] : newData;
        }),
    );

    connectionLog.on(
      'Log',
      (line: LogLineType) =>
        queryClient.setQueryData(logsQueryKey, (oldData: LogLineType[] | undefined) => {
          const newData = { ...line, timeStamp: formatStamp(line.timeStamp) };
          return oldData ? [...oldData, newData] : [newData];
        }),
    );

    connectionLog.start().catch(console.error);

    return () => {
      connectionLog.stop().catch(console.error);
    };
  }, [apikey]);
};

export const useLogsQuery = () => {
  useLogsSubscription();
  return useQuery<LogLineType[]>({
    queryKey: logsQueryKey,
    queryFn: () => [],
    initialData: [],
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
