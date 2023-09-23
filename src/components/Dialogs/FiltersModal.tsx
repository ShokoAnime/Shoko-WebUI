import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import ModalPanel from '@/components/Panels/ModalPanel';
import { useLazyGetFiltersQuery, useLazyGetTopFiltersQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';

import type { CollectionFilterType } from '@/core/types/api/collection';

type Props = {
  show: boolean;
  onClose: () => void;
};

function FiltersModal({ onClose, show }: Props) {
  const [trigger, filtersResult] = useLazyGetTopFiltersQuery({});
  const [triggerSubFilter, subFiltersResult] = useLazyGetFiltersQuery({});
  const filters: CollectionFilterType[] = filtersResult?.data?.List ?? [] as CollectionFilterType[];
  const subFilters: CollectionFilterType[] = useMemo(
    () => subFiltersResult?.data?.List ?? [] as CollectionFilterType[],
    [subFiltersResult],
  );

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

  const filteredList = useMemo(
    () =>
      subFilters.filter(
        item => (!item.IsDirectory && (search === '' || item.Name.toLowerCase().indexOf(search.toLowerCase()) !== -1)),
      ),
    [subFilters, search],
  );

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
      onClick={() => {
        setActiveTab(title);
        setActiveFilter(filterId);
        setSearch('');
      }}
    >
      {title}
    </div>
  );

  const renderSidePanel = (title: string, filterId: React.Key | null | undefined) => (
    <div
      className={cx('flex flex-col grow gap-y-2 pl-8', { hidden: activeTab !== title || filterId === '0' })}
      key={filterId}
    >
      <div className="mb-2 flex w-full rounded-md bg-panel-background-alt p-2">
        <Icon path={mdiMagnify} size={1} />
        <input
          type="text"
          placeholder="Search..."
          className="ml-2 bg-panel-background-alt"
          value={search}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
        />
      </div>
      <div className="box-border flex h-full flex-col items-center rounded-md border border-panel-border bg-panel-background-alt p-4">
        <div className="shoko-scrollbar flex max-h-[18rem] w-full flex-col gap-y-1  overflow-y-auto bg-panel-background-alt pr-4">
          {filteredList.length !== 0
            ? filteredList.filter(item => !item.IsDirectory).map(item => renderItem(item))
            : (
              <div className="text-center">
                Your search for&nbsp;
                <span className="font-semibold text-panel-important">{search}</span>
                &nbsp;returned zero results.
              </div>
            )}
        </div>
      </div>
    </div>
  );

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      title="Filters"
    >
      <div className="flex">
        <div className="flex min-h-[24rem] min-w-[8rem] flex-col gap-y-4 border-r-2 border-panel-border">
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
