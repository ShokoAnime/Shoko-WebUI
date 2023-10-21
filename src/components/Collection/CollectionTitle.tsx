import React from 'react';
import { Link } from 'react-router-dom';
import { mdiChevronRight } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

type Props = {
  count: number;
  filterOrGroup?: string;
};

const CollectionTitle = ({ count, filterOrGroup }: Props) => (
  <div className="flex items-center gap-x-2 text-xl font-semibold">
    <Link to="/webui/collection" className={cx(filterOrGroup ? 'text-panel-primary' : 'pointer-events-none')}>
      Entire Collection
    </Link>
    {filterOrGroup && (
      <>
        <Icon path={mdiChevronRight} size={1} />
        {filterOrGroup}
      </>
    )}
    <span>|</span>
    <span className="text-panel-important">
      {/* Count is set to -1 when series data is empty and is used as a flag to signify that in other places */}
      {/* But ideally we should 0 to the user */}
      {count === -1 ? 0 : count}
      &nbsp;Items
    </span>
  </div>
);

export default CollectionTitle;
