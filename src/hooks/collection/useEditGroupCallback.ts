import type React from 'react';

import { setGroupId } from '@/core/slices/modals/editGroup';
import { useDispatch } from '@/core/store';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

const useEditGroupCallback = (item: CollectionGroupType | SeriesType) => {
  const dispatch = useDispatch();

  return (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if ('MainSeries' in item.IDs) dispatch(setGroupId(item.IDs.ID));
    else if (item) dispatch(setGroupId(item.IDs.ParentGroup));
  };
};

export default useEditGroupCallback;
