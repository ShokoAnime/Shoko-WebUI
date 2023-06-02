import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { Icon } from '@mdi/react';
import { mdiMagnify } from '@mdi/js';

import ModalPanel from '../Panels/ModalPanel';
import { RootState } from '@/core/store';
import { setStatus } from '@/core/slices/modals/filters';
import { useLazyGetFiltersQuery, useLazyGetTopFiltersQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';

import type { CollectionFilterType } from '@/core/types/api/collection';

function FiltersModal() {
  const dispatch = useDispatch();
  const status = useSelector((state: RootState) => state.modals.filters.status);
  const [trigger, filtersResult] = useLazyGetTopFiltersQuery({});
  const [triggerSubFilter, subFiltersResult] = useLazyGetFiltersQuery({});
  const filters: Array<CollectionFilterType> = filtersResult?.data?.List ?? [] as Array<CollectionFilterType>;
  const subFilters: Array<CollectionFilterType> = subFiltersResult?.data?.List ?? [] as Array<CollectionFilterType>;

  const [activeTab, setActiveTab] = useState('Filters');
  const [activeFilter, setActiveFilter] = useState('0');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!status) { return; }
    if (activeFilter === '0') {
      trigger({}).catch(() => {});
    } else {
      triggerSubFilter(activeFilter).catch(() => {});
    }
  }, [status, activeFilter]);

  const handleClose = () => dispatch(setStatus(false));
  const filteredList = useMemo(() =>  subFilters.filter(item => !item.Directory && (search === '' || item.Name.toLowerCase().indexOf(search) !== -1) ), [subFilters, search]);

  const renderItem = (item: CollectionFilterType) => (
    <div className="flex justify-between font-semibold">
      <Link to={`collection/filter/${item.IDs.ID}`} onClick={() => handleClose()}>{item.Name}</Link>
      <span className="text-highlight-2">{item.Size}</span>
    </div>
  );
  
  const renderTabSide = (title, filterId) => (
    <div
      className={cx('font-semibold cursor-pointer', activeTab === title && 'text-highlight-1')}
      key={filterId}
      onClick={() => { setActiveTab(title); setActiveFilter(filterId); setSearch(''); }}
    >
      {title}
    </div>
  );
  
  const renderSidePanel = (title, filterId) => (
    <div className={cx('flex flex-col grow gap-y-2 pl-8', { hidden: activeTab !== title || filterId === '0' })}>
      <div className="box-border flex flex-col bg-background-border border border-background-border items-center rounded-md px-3 py-2">
        <div className="flex w-full border-background-alt border-b pb-2 mb-2">
          <Icon path={mdiMagnify} size={1} />
          <input type="text" placeholder="Search..." className="ml-2 bg-background-border" value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} />
        </div>
        <div className="flex flex-col w-full p-4 space-y-1 max-h-80 shoko-scrollbar overflow-y-auto">
          {filteredList.filter(item => !item.Directory).map(item => renderItem(item))}
        </div>
      </div>
    </div>
  );

  return (
    <ModalPanel
      show={status}
      className="p-8 flex-col drop-shadow-lg gap-y-8"
      onRequestClose={() => handleClose()}
    >
      <div className="font-semibold text-xl">Filters</div>
      <div className="flex">
        <div className="flex flex-col min-w-[8rem] border-r-2 border-background-border gap-y-4">
          {renderTabSide('Filters', '0')}
          {filters.filter(item => item.Directory).map(item => renderTabSide(item.Name, item.IDs.ID))}
        </div>
        <div className={cx('flex flex-col grow gap-y-2 pl-8', { hidden: activeTab !== 'Filters' })}>
          {filters.filter(item => !item.Directory).map(item => renderItem(item))}
        </div>
        {filters.filter(item => item.Directory).map(item => renderSidePanel(item.Name, item.IDs.ID))}
        
      </div>
    </ModalPanel>
  );
}

export default FiltersModal;
