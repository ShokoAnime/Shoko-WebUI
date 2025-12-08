import type React from 'react';
import { useDispatch } from 'react-redux';

import { setGroupId } from '@/core/slices/modals/editGroup';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

const useEditGroupCallback = (item: CollectionGroupType | SeriesType) => {
  const dispatch = useDispatch();

  return (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (item) dispatch(setGroupId(item.IDs.ParentGroup ?? item.IDs.TopLevelGroup));
  };
};

export default useEditGroupCallback;
