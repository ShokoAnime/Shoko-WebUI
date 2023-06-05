import React, { useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { Icon } from '@mdi/react';
import { mdiMagnify } from '@mdi/js';

import ModalPanel from '../Panels/ModalPanel';
import { useLazyGetFiltersQuery, useLazyGetTopFiltersQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';

import type { CollectionFilterType } from '@/core/types/api/collection';

type Props = {
  show: boolean;
  onClose: () => void;
};

function FiltersModal({ show, onClose }: Props) {
  const [trigger, filtersResult] = useLazyGetTopFiltersQuery({});
  const [triggerSubFilter, subFiltersResult] = useLazyGetFiltersQuery({});
  const filters: Array<CollectionFilterType> = filtersResult?.data?.List ?? [] as Array<CollectionFilterType>;
  const subFilters: Array<CollectionFilterType> = subFiltersResult?.data?.List ?? [] as Array<CollectionFilterType>;

  const [activeTab, setActiveTab] = useState('Filters');
  const [activeFilter, setActiveFilter] = useState('0');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!show) return;
    if (activeFilter === '0') {
      trigger({}).catch(() => {});
    } else {
      triggerSubFilter(activeFilter).catch(() => {});
    }
  }, [show, activeFilter]);

  const filteredList = useMemo(() =>  subFilters.filter(item => !item.Directory && (search === '' || item.Name.toLowerCase().indexOf(search) !== -1) ), [subFilters, search]);

  const renderItem = (item: CollectionFilterType) => (
    <div className="flex justify-between font-semibold" key={item.IDs.ID}>
      <Link to={`/webui/collection/filter/${item.IDs.ID}`} onClick={onClose}>{item.Name}</Link>
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
    <div className={cx('flex flex-col grow gap-y-2 pl-8', { hidden: activeTab !== title || filterId === '0' })} key={filterId}>
      <div className="flex w-full bg-background-border p-2 mb-2 rounded-md">
        <Icon path={mdiMagnify} size={1} />
        <input type="text" placeholder="Search..." className="bg-background-border ml-2" value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} />
      </div>
      <div className="box-border flex flex-col bg-background-border border border-background-border items-center rounded-md p-4">
        <div className="flex flex-col w-full pr-4 gap-y-1 max-h-80 shoko-scrollbar overflow-y-auto">
          {filteredList.filter(item => !item.Directory).map(item => renderItem(item))}
        </div>
      </div>
    </div>
  );

  return (
    <ModalPanel
      show={show}
      className="p-8 flex-col drop-shadow-lg gap-y-8"
      onRequestClose={onClose}
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
