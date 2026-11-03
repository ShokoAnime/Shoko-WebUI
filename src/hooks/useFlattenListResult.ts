import { useMemo } from 'react';

import type { ListResultType } from '@/core/types/api';
import type { InfiniteData } from '@tanstack/react-query';

const useFlattenListResult = <T>(data: InfiniteData<ListResultType<T>> | undefined): [T[], number] =>
  useMemo(
    () => {
      if (data) {
        // flatMap turns a page without a List into a single undefined entry, so drop those before they reach callers
        return [
          data.pages.flatMap(page => page.List ?? []).filter(Boolean),
          data.pages[0]?.Total ?? 0,
        ];
      }
      return [[] as T[], 0];
    },
    [data],
  );

export default useFlattenListResult;
