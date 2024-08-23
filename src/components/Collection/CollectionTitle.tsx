import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { mdiChevronRight } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

type Props = {
  count: number;
  filterActive: boolean;
  filterOrGroup?: string;
  searchQuery: string;
};

const CollectionTitle = memo(({ count, filterActive, filterOrGroup, searchQuery }: Props) => (
  <div className="flex items-center min-w-0 gap-x-2 text-xl font-semibold">
    <Link to="/webui/collection" className={cx(filterOrGroup ? 'text-panel-text-primary' : 'pointer-events-none')}>
      Collection
    </Link>
    {filterOrGroup && (
      <>
        <Icon className="flex-none" path={mdiChevronRight} size={1} />
        <span className="truncate">
          {filterOrGroup}
        </span>
      </>
    )}
    {!filterOrGroup && filterActive && (
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
          {`${count} Items`}
          &nbsp;
        </span>
      </>
    )}
  </div>
));

export default CollectionTitle;
