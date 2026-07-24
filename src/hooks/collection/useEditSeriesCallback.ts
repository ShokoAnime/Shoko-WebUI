import type { MouseEvent } from 'react';

import { setSeriesId } from '@/core/slices/modals/editSeries';
import { useDispatch } from '@/core/store';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

const useEditSeriesCallback = (item: CollectionGroupType | SeriesType) => {
  const dispatch = useDispatch();

  return (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    dispatch(setSeriesId(('MainSeries' in item.IDs) ? item.IDs.MainSeries : item.IDs.ID));
  };
};

export default useEditSeriesCallback;
