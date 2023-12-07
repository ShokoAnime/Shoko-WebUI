/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Figure how to add types to everything
import { defaultSerializeQueryArgs } from '@reduxjs/toolkit/query';
import { omit } from 'lodash';

import type { InfiniteResultType, ListResultType, PaginationType } from '@/core/types/api';
import type { EndpointDefinition } from '@reduxjs/toolkit/query';

export const transformPaginatedResponse = (response: ListResultType<any>, _: any, args: PaginationType) => ({
  pages: {
    [args.page ?? 1]: response.List,
  },
  total: response.Total,
});

export const serializePaginatedQueryArgs = (
  { endpointDefinition, endpointName, queryArgs }: {
    endpointDefinition: EndpointDefinition<any, any, any, any>;
    endpointName: string;
    queryArgs: PaginationType;
  },
) =>
  defaultSerializeQueryArgs({
    endpointName,
    queryArgs: omit(queryArgs, ['page']),
    endpointDefinition,
  });

export const paginatedQueryMerge = (currentCache: InfiniteResultType<any>, newItems: InfiniteResultType<any>) => {
  const tempCache = { ...currentCache };
  tempCache.pages = { ...currentCache.pages, ...newItems.pages };
  return tempCache;
};

export const paginatedForceRefetch = ({ currentArg, previousArg }: { currentArg: any, previousArg: any }) =>
  currentArg !== previousArg;
