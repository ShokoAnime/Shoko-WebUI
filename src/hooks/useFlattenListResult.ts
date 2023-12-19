import { useMemo } from 'react';

import type { ListResultType } from '@/core/types/api';
import type { InfiniteData } from '@tanstack/react-query';

export const useFlattenListResult = <T>(data: InfiniteData<ListResultType<T>> | undefined): [T[], number] =>
  useMemo(
    () => {
      if (data) {
        return [
          data.pages.flatMap(page => page.List),
          data.pages[0].Total,
        ];
      }
      return [[] as T[], 0];
    },
    [data],
  );
