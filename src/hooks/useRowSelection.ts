import { useEffect, useMemo } from 'react';
import { toNumber } from 'lodash';
import { useImmer } from 'use-immer';

import type { EpisodeType } from '@/core/types/api/episode';
import type { FileType } from '@/core/types/api/file';
import type { SeriesType } from '@/core/types/api/series';

export const fileIdSelector = (file: FileType) => file.ID;

export const episodeOrSeriesIdSelector = (item: EpisodeType | SeriesType) => item.IDs.ID;

const useRowSelection = <T extends object>(items: T[], idSelector: (item: NoInfer<T>) => number) => {
  const [rowSelection, setRowSelection] = useImmer<Record<number, boolean>>({});

  const selectedRows = useMemo(
    () =>
      Object
        .keys(rowSelection)
        .filter(key => rowSelection[key])
        .reduce((result, key) => {
          const row = items.find((item) => {
            const id = idSelector(item);
            return id === toNumber(key);
          });
          if (row) result.push(row);
          return result;
        }, [] as T[]),
    [rowSelection, items, idSelector],
  );

  const handleRowSelect = (id: number, select: boolean) => {
    setRowSelection((draftState) => {
      draftState[id] = select;
      return draftState;
    });
  };

  useEffect(() => {
    if (items.length === 0) setRowSelection({});
  }, [items.length, setRowSelection]);

  return { handleRowSelect, rowSelection, setRowSelection, selectedRows };
};

export default useRowSelection;
