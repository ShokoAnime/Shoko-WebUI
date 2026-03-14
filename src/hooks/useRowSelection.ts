import { useEffect, useMemo } from 'react';
import { toNumber } from 'lodash';
import { useImmer } from 'use-immer';

import type { EpisodeType } from '@/core/types/api/episode';
import type { FileType } from '@/core/types/api/file';
import type { SeriesType } from '@/core/types/api/series';
import type { ManualLinkType } from '@/core/types/utilities/unrecognized-utility';

type RowType = EpisodeType | FileType | SeriesType | ManualLinkType;

const getIdFromRow = (item: RowType) => {
  if ('ID' in item) {
    return item.ID;
  }

  if ('IDs' in item) {
    return item.IDs.ID;
  }

  if ('id' in item) {
    return item.id;
  }

  return 0;
};

const useRowSelection = <T extends RowType>(items: T[]) => {
  const [rowSelection, setRowSelection] = useImmer<Record<number, boolean>>({});

  const selectedRows = useMemo(
    () =>
      Object
        .keys(rowSelection)
        .filter(key => rowSelection[key])
        .reduce((result, key) => {
          const row = items.find((item) => {
            const id = getIdFromRow(item);
            return id === toNumber(key);
          });
          if (row) result.push(row);
          return result;
        }, [] as T[]),
    [rowSelection, items],
  );

  const handleRowSelect = (id: number, select?: boolean) => {
    setRowSelection((draftState) => {
      draftState[id] = select ?? !draftState[id];
    });
  };

  useEffect(() => {
    if (items.length === 0) setRowSelection({});
  }, [items.length, setRowSelection]);

  return { handleRowSelect, rowSelection, setRowSelection, selectedRows };
};

export default useRowSelection;
