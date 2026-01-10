import type React from 'react';
import { useDispatch } from 'react-redux';

import { setSeriesId } from '@/core/slices/modals/editSeries';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

const useEditSeriesCallback = (item: CollectionGroupType | SeriesType) => {
  const dispatch = useDispatch();

  return (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    dispatch(setSeriesId(('MainSeries' in item.IDs) ? item.IDs.MainSeries : item.IDs.ID));
  };
};

export default useEditSeriesCallback;
