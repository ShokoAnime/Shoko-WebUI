import React from 'react';
import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router';
import { mdiChevronRight } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import { resetFilter } from '@/core/slices/collection';

type Props = {
  count: number;
  filterActive: boolean;
  filterName?: string;
  groupName?: string;
  searchQuery: string;
};

const CollectionTitle = React.memo(({ count, filterActive, filterName, groupName, searchQuery }: Props) => {
  const { groupId } = useParams();
  const dispatch = useDispatch();

  const handlFilterReset = () => {
    dispatch(resetFilter());
  };

  return (
    <div className="flex min-w-0 items-center gap-x-2 text-xl font-semibold">
      <Link
        to="/webui/collection"
        className={cx((filterName ?? groupName ?? filterActive) ? 'text-panel-text-primary' : 'pointer-events-none')}
      >
        Collection
      </Link>
      {groupName && (
        <>
          <Icon className="flex-none" path={mdiChevronRight} size={1} />
          <Link
            to={`/webui/collection/group/${groupId}`}
            className={cx(
              (filterName ?? filterActive) ? 'text-panel-text-primary' : 'pointer-events-none',
              'truncate',
            )}
          >
            {groupName}
          </Link>
        </>
      )}
      {filterName && (
        <>
          <Icon className="flex-none" path={mdiChevronRight} size={1} />
          <span
            className={cx('truncate', filterActive && 'text-panel-text-primary cursor-pointer')}
            onClick={handlFilterReset}
          >
            {filterName}
          </span>
        </>
      )}
      {filterActive && (
        <>
          <Icon className="flex-none" path={mdiChevronRight} size={1} />
          Filtered
        </>
      )}
      {searchQuery && (
        <>
          <Icon className="flex-none" path={mdiChevronRight} size={1} />
          <span className="flex-none">
            Search Results
          </span>
        </>
      )}
      {count >= 0 && (
        <>
          <span>|</span>
          <span className="flex-none text-panel-text-important">
            {`${count} ${count === 1 ? 'Item' : 'Items'}`}
            &nbsp;
          </span>
        </>
      )}
    </div>
  );
});

export default CollectionTitle;
