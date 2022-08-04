import React, { useEffect } from 'react';

import ModalPanel from '../Panels/ModalPanel';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../core/store';
import { setStatus } from '../../core/slices/modals/filters';
import { useLazyGetTopFiltersQuery } from '../../core/rtkQuery/collectionApi';

import type { CollectionFilterType } from '../../core/types/api/collection';

function FiltersModal() {
  const dispatch = useDispatch();
  const status = useSelector((state: RootState) => state.modals.filters.status);
  const [trigger, filtersResult] = useLazyGetTopFiltersQuery({});
  const filters: Array<CollectionFilterType> = filtersResult?.data?.List ?? [] as Array<CollectionFilterType>;
  
  useEffect(() => {
    if (!status) { return; }
    trigger({}).catch(() => {});
  }, [status]);

  const handleClose = () => dispatch(setStatus(false));
  
  const renderItem = (item: CollectionFilterType) => (
    <div className="flex justify-between font-semibold">
      <span>{item.Name}</span>
      <span className="text-highlight-2">{item.Size}</span>
    </div>
  );

  const renderTab = item => (
    <div className="grow px-4 py-2 bg-background-alt self-stretch border-b border-background-border shadow">
      <p className="text-base font-semibold text-gray-300">{item.Name}</p>
    </div>
  );
  
  return (
    <ModalPanel
      sidebarSnap
      show={status}
      className="pb-6"
      onRequestClose={() => handleClose()}
    >
      <div className="flex flex-col w-full border-l border-background-border drop-shadow-[4px_0_4px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col items-center justify-start bg-color-nav">
          <div className="grow px-4 py-2 bg-background-alt self-stretch border-b border-background-border shadow">
            <p className="text-base font-semibold text-gray-300">Filters</p>
          </div>
          <div className="flex flex-col w-full p-4 space-y-1">
          {filters.filter(item => !item.Directory).map(item => renderItem(item))}
          </div>
          {filters.filter(item => item.Directory).map(item => renderTab(item))}
        </div>
      </div>
    </ModalPanel>
  );
}

export default FiltersModal;