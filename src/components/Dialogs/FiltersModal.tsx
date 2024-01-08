import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { mdiLoading, mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { useDebounce } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useFiltersQuery, useSubFiltersQuery } from '@/core/react-query/filter/queries';

import type { CollectionFilterType } from '@/core/types/api/collection';

type Props = {
  show: boolean;
  onClose: () => void;
};

const TabButton = (
  props: { activeTab: string, filterId: number, onTabChange: (filterId: number, title: string) => void, title: string },
) => {
  const { activeTab, filterId, onTabChange, title } = props;
  return (
    <div
      className={cx('font-semibold cursor-pointer', activeTab === title && 'text-panel-text-primary')}
      key={filterId}
      onClick={() => onTabChange(filterId, title)}
    >
      {title}
    </div>
  );
};

const Item = ({ item, onClose }: { item: CollectionFilterType, onClose: () => void }) => (
  <div className="flex justify-between font-semibold" key={item.IDs.ID}>
    <Link to={`/webui/collection/filter/${item.IDs.ID}`} onClick={onClose}>{item.Name}</Link>
    <span className="text-panel-text-important">{item.Size}</span>
  </div>
);

const SidePanel = (
  props: { activeFilter: number, activeTab: string, filterId: number, onClose: () => void, title: string },
) => {
  const { activeFilter, activeTab, filterId, onClose, title } = props;

  const subFiltersQuery = useSubFiltersQuery(filterId, activeFilter === filterId);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);

  useEffect(() => () => setSearch(''), []);

  const filteredList = useMemo(() => {
    if (subFiltersQuery.isSuccess) {
      return subFiltersQuery.data.List.filter(
        item => (!item.IsDirectory
          && (debouncedSearch === '' || item.Name.toLowerCase().indexOf(debouncedSearch.toLowerCase()) !== -1)),
      );
    }
    return [];
  }, [debouncedSearch, subFiltersQuery.data, subFiltersQuery.isSuccess]);

  if (activeFilter !== filterId) return null;

  return (
    <div
      className={cx('flex flex-col grow gap-y-2 pl-8', { hidden: activeTab !== title || filterId === 0 })}
    >
      <Input
        type="text"
        placeholder="Search..."
        startIcon={mdiMagnify}
        id="search"
        value={search}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
        inputClassName="px-4 py-3"
      />
      <div className="box-border flex h-full flex-col items-center rounded-md border border-panel-border bg-panel-background-alt p-4">
        <div className="shoko-scrollbar flex max-h-[18rem] w-full grow flex-col gap-y-1 overflow-y-auto bg-panel-background-alt pr-4">
          {subFiltersQuery.isPending && (
            <div className="flex grow items-center justify-center">
              <Icon path={mdiLoading} spin size={3} className="text-panel-text-primary" />
            </div>
          )}

          {subFiltersQuery.isSuccess && filteredList.length === 0 && (
            <div className="text-center">
              Your search for&nbsp;
              <span className="font-semibold text-panel-text-important">{search}</span>
              &nbsp;returned zero results.
            </div>
          )}

          {subFiltersQuery.isSuccess && filteredList.length > 0 && (
            filteredList.filter(item => !item.IsDirectory)
              .map(item => <Item item={item} key={item.IDs.ID} onClose={onClose} />)
          )}
        </div>
      </div>
    </div>
  );
};

function FiltersModal({ onClose, show }: Props) {
  const filtersQuery = useFiltersQuery(show);
  const filters = useMemo(() => filtersQuery.data?.List ?? [], [filtersQuery.data]);

  const [activeTab, setActiveTab] = useState('Filters');
  const [activeFilter, setActiveFilter] = useState(0);

  const onTabChange = (filterId: number, title: string) => {
    setActiveTab(title);
    setActiveFilter(filterId);
  };

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      title="Filters"
    >
      <div className="flex">
        <div className="flex min-h-[24rem] min-w-[8rem] flex-col gap-y-4 border-r-2 border-panel-border">
          <TabButton activeTab={activeTab} filterId={0} onTabChange={onTabChange} title="Filters" />
          {filters.filter(item => item.IsDirectory)
            .map(item => (
              <TabButton
                key={item.IDs.ID}
                activeTab={activeTab}
                filterId={item.IDs.ID}
                onTabChange={onTabChange}
                title={item.Name}
              />
            ))}
        </div>

        {filtersQuery.isPending && (
          <div className="flex grow items-center justify-center">
            <Icon path={mdiLoading} spin size={3} className="text-panel-text-primary" />
          </div>
        )}

        {filtersQuery.isSuccess && activeTab === 'Filters' && (
          <div className="flex max-h-[24rem] grow flex-col gap-y-2 overflow-y-auto pl-8">
            {filters.filter(item => !item.IsDirectory).map(item => (
              <div key={item.IDs.ID} className="pr-4">
                <Item item={item} onClose={onClose} />
              </div>
            ))}
          </div>
        )}

        {filtersQuery.isSuccess && activeTab !== 'Filters' && filters
          .filter(
            item => item.IsDirectory,
          ).map(
            item => (
              <SidePanel
                key={item.IDs.ID}
                filterId={item.IDs.ID}
                activeFilter={activeFilter}
                activeTab={activeTab}
                title={item.Name}
                onClose={onClose}
              />
            ),
          )}
      </div>
    </ModalPanel>
  );
}

export default FiltersModal;
