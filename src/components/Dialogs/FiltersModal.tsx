import React, { useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { Icon } from '@mdi/react';
import { mdiMagnify } from '@mdi/js';

import { useLazyGetFiltersQuery, useLazyGetTopFiltersQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';

import type { CollectionFilterType } from '@/core/types/api/collection';
import ModalPanel from '../Panels/ModalPanel';

type Props = {
  show: boolean;
  onClose: () => void;
};

function FiltersModal({ show, onClose }: Props) {
  const [trigger, filtersResult] = useLazyGetTopFiltersQuery({});
  const [triggerSubFilter, subFiltersResult] = useLazyGetFiltersQuery({});
  const filters: Array<CollectionFilterType> = filtersResult?.data?.List ?? [] as Array<CollectionFilterType>;
  const subFilters: Array<CollectionFilterType> = useMemo(() => subFiltersResult?.data?.List ?? [] as Array<CollectionFilterType>, [subFiltersResult]);

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
  }, [show, activeFilter, trigger, triggerSubFilter]);

  const filteredList = useMemo(() => subFilters.filter(item => !item.IsDirectory && (search === '' || item.Name.toLowerCase().indexOf(search.toLowerCase()) !== -1)), [subFilters, search]);

  const renderItem = (item: CollectionFilterType) => (
    <div className="flex justify-between font-semibold" key={item.IDs.ID}>
      <Link to={`/webui/collection/filter/${item.IDs.ID}`} onClick={onClose}>{item.Name}</Link>
      <span className="text-panel-important">{item.Size}</span>
    </div>
  );

  const renderTabSide = (title, filterId) => (
    <div
      className={cx('font-semibold cursor-pointer', activeTab === title && 'text-panel-primary')}
      key={filterId}
      onClick={() => { setActiveTab(title); setActiveFilter(filterId); setSearch(''); }}
    >
      {title}
    </div>
  );

  const renderSidePanel = (title: string, filterId: React.Key | null | undefined) => (
    <div className={cx('flex flex-col grow gap-y-2 pl-8', { hidden: activeTab !== title || filterId === '0' })} key={filterId}>
      <div className="flex w-full bg-panel-background-alt p-2 mb-2 rounded-md">
        <Icon path={mdiMagnify} size={1} />
        <input type="text" placeholder="Search..." className="bg-panel-background-alt ml-2" value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} />
      </div>
      <div className="box-border flex flex-col bg-panel-background-alt border border-panel-border items-center rounded-md p-4 h-full">
        <div className="flex flex-col w-full pr-4 gap-y-1 max-h-[18rem]  shoko-scrollbar overflow-y-auto bg-panel-background-alt">
          {
            filteredList.length !== 0
              ? filteredList.filter(item => !item.IsDirectory).map(item => renderItem(item))
              : <div className="text-center">Your search for <span className="text-panel-important font-semibold">{search}</span> returned zero results.</div>
          }
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
        <div className="flex flex-col min-w-[8rem] min-h-[24rem] border-r-2 border-panel-border gap-y-4">
          {renderTabSide('Filters', '0')}
          {filters.filter(item => item.IsDirectory).map(item => renderTabSide(item.Name, item.IDs.ID))}
        </div>
        <div className={cx('flex flex-col grow gap-y-2 pl-8', { hidden: activeTab !== 'Filters' })}>
          {filters.filter(item => !item.IsDirectory).map(item => renderItem(item))}
        </div>
        {filters.filter(item => item.IsDirectory).map(item => renderSidePanel(item.Name, item.IDs.ID))}

      </div>
    </ModalPanel>
  );
}

export default FiltersModal;
