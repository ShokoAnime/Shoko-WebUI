import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router';
import { mdiLoading, mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { useDebounceValue } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useFiltersQuery, useSubFiltersQuery } from '@/core/react-query/filter/queries';
import { resetFilter } from '@/core/slices/collection';
import useEventCallback from '@/hooks/useEventCallback';

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

const Item = ({ item, onClose }: { item: CollectionFilterType, onClose: () => void }) => {
  const dispatch = useDispatch();

  const handleClose = useEventCallback(() => {
    dispatch(resetFilter());
    onClose();
  });

  return (
    <div
      // TODO: Disable selecting empty filter presets for now. Remove the disable condition once editing presets is possible
      className={cx(
        'flex justify-between pb-1 pr-4 font-semibold',
        item.Size === 0 && 'pointer-events-none opacity-65',
      )}
      key={item.IDs.ID}
    >
      <Link to={`/webui/collection/filter/${item.IDs.ID}`} onClick={handleClose}>{item.Name}</Link>
      <span className="text-panel-text-important">{item.Size}</span>
    </div>
  );
};

const SidePanel = (
  props: { activeFilter: number, activeTab: string, filterId: number, onClose: () => void, title: string },
) => {
  const { activeFilter, activeTab, filterId, onClose, title } = props;

  const subFiltersQuery = useSubFiltersQuery(filterId, activeFilter === filterId);

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 200);

  useEffect(() => () => setSearch(''), []);

  const filteredList = useMemo(() => {
    if (subFiltersQuery.isSuccess) {
      return subFiltersQuery.data.List.filter(
        item => (!item.IsDirectory
          && (debouncedSearch === '' || item.Name.toLowerCase().includes(debouncedSearch.toLowerCase()))),
      );
    }
    return [];
  }, [debouncedSearch, subFiltersQuery.data, subFiltersQuery.isSuccess]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filteredList.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 28,
    overscan: 5,
  });
  const virtualItems = virtualizer.getVirtualItems();

  if (activeFilter !== filterId) return null;

  return (
    <div
      className={cx('flex flex-col grow gap-y-2 pl-8', {
        hidden: activeTab !== title || filterId === 0,
      })}
    >
      {!subFiltersQuery.isSuccess && (
        <div className="flex grow items-center justify-center">
          <Icon path={mdiLoading} spin size={3} className="text-panel-text-primary" />
        </div>
      )}

      {subFiltersQuery.isSuccess && (
        <>
          <Input
            type="text"
            placeholder="Search..."
            startIcon={mdiMagnify}
            id="search"
            value={search}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
            inputClassName="px-4 py-3"
          />
          <div className="flex grow overflow-y-auto rounded-lg border border-panel-border bg-panel-input p-4">
            {filteredList.length === 0 && (
              <div className="flex grow items-center justify-center">
                Your search for&nbsp;
                <span className="font-semibold text-panel-text-important">{search}</span>
                &nbsp;returned zero results.
              </div>
            )}

            {filteredList.length > 0 && (
              <div className="relative flex w-full grow flex-col overflow-y-auto bg-panel-input" ref={scrollRef}>
                {/* This extra absolute div exists to make the height of this container fixed otherwise it overflows for some reason */}
                <div className="absolute top-0 w-full" style={{ height: virtualizer.getTotalSize() }}>
                  <div
                    className="absolute left-0 top-0 w-full"
                    style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}
                  >
                    {virtualItems.map((virtualRow) => {
                      const item = filteredList[virtualRow.index];
                      return <Item key={item.IDs.ID} item={item} onClose={onClose} />;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const FilterPresetsModal = ({ onClose, show }: Props) => {
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
      size="md"
      onRequestClose={onClose}
      header="Filter Presets"
    >
      <div className="flex">
        <div className="flex min-h-96 min-w-32 flex-col gap-y-4 border-r-2 border-panel-border">
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
          <div className="flex max-h-96 grow flex-col gap-y-1 overflow-y-auto pl-8">
            {filters.filter(item => !item.IsDirectory).map(item => (
              <Item key={item.IDs.ID} item={item} onClose={onClose} />
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
};

export default FilterPresetsModal;
