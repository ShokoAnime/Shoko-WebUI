import { useEffect, useMemo } from 'react';
import { toNumber } from 'lodash';
import { useImmer } from 'use-immer';

import type { EpisodeType } from '@/core/types/api/episode';
import type { SeriesType } from '@/core/types/api/series';

const defaultIdSelector = (item: object) => {
  if ('ID' in item && typeof item.ID === 'number') {
    return item.ID;
  }
  if ('IDs' in item && typeof (item as EpisodeType | SeriesType).IDs.ID === 'number') {
    return (item as EpisodeType | SeriesType).IDs.ID;
  }
  if ('id' in item && typeof item.id === 'number') {
    return item.id;
  }
  return 0;
};

const useRowSelection = <T extends object>(
  items: T[],
  idSelector: (item: NoInfer<T>) => number = defaultIdSelector,
) => {
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
