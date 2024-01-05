import { useMemo } from 'react';
import { toNumber } from 'lodash';
import { useImmer } from 'use-immer';

import useEventCallback from '@/hooks/useEventCallback';

import type { FileType } from '@/core/types/api/file';
import type { SeriesType } from '@/core/types/api/series';

const useRowSelection = <T extends FileType | SeriesType>(items: T[]) => {
  const [rowSelection, setRowSelection] = useImmer<Record<number, boolean>>({});

  const selectedRows = useMemo(
    () =>
      Object
        .keys(rowSelection)
        .filter(key => rowSelection[key])
        .reduce((result, key) => {
          const row = items.find((item) => {
            if ('ID' in item) return item.ID === toNumber(key);
            return item.IDs.ID === toNumber(key);
          });
          if (row) return [...result, row];
          return result;
        }, [] as T[]),
    [rowSelection, items],
  );

  const handleRowSelect = useEventCallback((id: number, select: boolean) => {
    setRowSelection((immerState) => {
      immerState[id] = select;
      return immerState;
    });
  });

  return { handleRowSelect, rowSelection, setRowSelection, selectedRows };
};

export default useRowSelection;
