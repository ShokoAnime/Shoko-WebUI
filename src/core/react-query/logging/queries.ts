import { useEffect } from 'react';
import { HttpTransportType, HubConnectionBuilder, JsonHubProtocol, LogLevel } from '@microsoft/signalr';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import queryClient from '@/core/react-query/queryClient';
import { useSelector } from '@/core/store';
import { dayjs } from '@/core/util';

import type { LogEventType, LogReadResultType, LogsSearchParamsType } from '@/core/react-query/logging/types';

const logsQueryKey = ['logs'];

export const formatStamp = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss');
const formatTimestamps = (lines: LogEventType[]): LogEventType[] =>
  lines.map<LogEventType>(item => ({ ...item, TimeStamp: formatStamp(item.TimeStamp) }));

const useLogsSubscription = () => {
  const apikey = useSelector(state => state.apiSession.apikey);

  useEffect(() => {
    const connectionLogHub = '/signalr/logging';
    const protocol = new JsonHubProtocol();
    // oxlint-disable-next-line no-bitwise
    const transport = HttpTransportType.WebSockets | HttpTransportType.LongPolling;
    const options = {
      transport,
      logMessageContent: true,
      logger: LogLevel.Warning,
      accessTokenFactory: () => apikey,
    };

    const connectionLog = new HubConnectionBuilder().withUrl(connectionLogHub, options).withHubProtocol(protocol)
      .withAutomaticReconnect([5000, 15000, 30000, 60000, 90000])
      .build();

    connectionLog.onreconnected(() => {
      // The server re-sends GetBacklog on every connect; reset the tail so the
      // fresh backlog replaces the stale one instead of duplicating entries.
      queryClient.setQueryData(logsQueryKey, []);
    });

    connectionLog.on(
      'GetBacklog',
      (lines: LogEventType[]) => {
        queryClient.setQueryData(logsQueryKey, (oldData: LogEventType[] | undefined) => {
          const newData = formatTimestamps(lines);
          return oldData ? [...oldData, ...newData] : newData;
        });
      },
    );

    connectionLog.on(
      'Log',
      (line: LogEventType) => {
        queryClient.setQueryData(logsQueryKey, (oldData: LogEventType[] | undefined) => {
          const newData = { ...line, TimeStamp: formatStamp(line.TimeStamp) };
          return oldData ? [...oldData, newData] : [newData];
        });
      },
    );

    connectionLog.start().catch(console.error);

    return () => {
      connectionLog.stop().catch(console.error);
    };
  }, [apikey]);
};

export const useLogsQuery = () => {
  useLogsSubscription();
  return useQuery<LogEventType[]>({
    queryKey: logsQueryKey,
    queryFn: () => [],
    initialData: [],
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useLogsSearchQuery = ({ levels, search }: LogsSearchParamsType) =>
  useInfiniteQuery<LogReadResultType>({
    queryKey: ['logs', 'search', { search, levels }],
    queryFn: ({ pageParam }) =>
      axios.get('Logging/Range/Read', {
        params: {
          offset: pageParam,
          limit: 100,
          descending: true,
          // Server expects a comma-separated list of LogLevel names; omitted params are inactive filters.
          level: levels.size > 0 ? [...levels].join(',') : undefined,
          message: search,
        },
      }),
    getNextPageParam: lastPage => lastPage.NextOffset,
    initialPageParam: 0,
  });
