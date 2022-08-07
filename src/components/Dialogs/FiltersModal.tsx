import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { Icon } from '@mdi/react';
import { mdiChevronUp, mdiMagnify } from '@mdi/js';

import ModalPanel from '../Panels/ModalPanel';
import { RootState } from '../../core/store';
import { setStatus } from '../../core/slices/modals/filters';
import { useLazyGetTopFiltersQuery, useLazyGetFiltersQuery } from '../../core/rtkQuery/collectionApi';

import type { CollectionFilterType } from '../../core/types/api/collection';

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

  const renderTab = (title, filterId) => (
    <React.Fragment>
      <div className="grow px-4 py-2 bg-background-alt self-stretch border-b border-background-border shadow flex justify-between">
        <p className="text-base font-semibold text-gray-300">{title}</p>
        <span onClick={() => { setActiveTab(title); setActiveFilter(filterId); setSearch(''); }}><Icon className="cursor-pointer" path={mdiChevronUp} size={1} rotate={activeTab === title ? 0 : 180} /></span>
      </div>
      <div className={cx('flex flex-col grow w-full p-4', { hidden: activeTab !== title || filterId === '0' })}>
        <div className="box-border flex flex-col bg-background-alt border border-background-border items-center rounded-md px-3 py-2">
          <div className="flex w-full  border-background-border border-b pb-2 mb-2">
            <Icon path={mdiMagnify} size={1} />
            <input type="text" placeholder="Search..." className="ml-2 bg-background-alt" value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} />
          </div>
          <div className="flex flex-col w-full p-4 space-y-1 max-h-80 shoko-scrollbar overflow-y-auto">
            {filteredList.filter(item => !item.Directory).map(item => renderItem(item))}
          </div>
        </div>
      </div>
    </React.Fragment>
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
          {renderTab('Filters', '0')}
          <div className={cx('flex flex-col w-full p-4 space-y-1', { hidden: activeTab !== 'Filters' })}>
          {filters.filter(item => !item.Directory).map(item => renderItem(item))}
          </div>
          {filters.filter(item => item.Directory).map(item => renderTab(item.Name, item.IDs.ID))}
          
        </div>
      </div>
    </ModalPanel>
  );
}

export default FiltersModal;