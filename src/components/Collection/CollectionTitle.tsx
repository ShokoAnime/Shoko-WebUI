import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { mdiChevronRight } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

type Props = {
  count: number;
  filterOrGroup?: string;
  searchQuery: string;
};

const CollectionTitle = memo(({ count, filterOrGroup, searchQuery }: Props) => (
  <div className="flex items-center gap-x-2 text-xl font-semibold">
    <Link to="/webui/collection" className={cx(filterOrGroup ? 'text-panel-text-primary' : 'pointer-events-none')}>
      Entire Collection
    </Link>
    {filterOrGroup && (
      <>
        <Icon path={mdiChevronRight} size={1} />
        {filterOrGroup}
      </>
    )}
    {searchQuery && (
      <>
        <Icon path={mdiChevronRight} size={1} />
        Search Results
      </>
    )}
    {count >= 0 && (
      <>
        <span>|</span>
        <span className="text-panel-text-important">
          {`${count} Items`}
        </span>
      </>
    )}
  </div>
));

export default CollectionTitle;
