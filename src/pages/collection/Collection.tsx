import React, { useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import { mdiChevronRight, mdiCogOutline, mdiFilterOutline, mdiFormatListText, mdiViewGridOutline } from '@mdi/js';

import CollectionView from '@/components/Collection/CollectionView';
import FiltersModal from '@/components/Dialogs/FiltersModal';
import { useGetFilterQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';

const Title = ({ count, filter }: { count: number, filter?: string }) => (
  <div className="font-semibold text-xl flex gap-x-2 items-center">
    <Link to="/webui/collection" className={cx(filter ? 'text-highlight-1' : 'pointer-events-none')}>Entire Collection</Link>
    {filter && (
      <>
        <Icon path={mdiChevronRight} size={1} />
        {filter}
      </>
    )}
    <span>|</span>
    <span className="text-highlight-2">{count} Items</span>
  </div>
);

const OptionButton = ({ icon, onClick }) => (
  <div className="px-5 py-2 rounded border-background-border border bg-background-nav drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] cursor-pointer" onClick={onClick}>
    <Icon path={icon} size={1} />
  </div>
);

function Collection() {
  const { filterId } = useParams();

  const filterData = useGetFilterQuery({ filterId }, { skip: !filterId });
  const filterName = filterId && filterData?.data?.Name;

  const [mode, setMode] = useState('grid');
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [groupTotal, setGroupTotal] = useState(0);

  const toggleMode = () => setMode(mode === 'card' ? 'grid' : 'card');
  const toggleFilters = () => { setShowFilterSidebar(!showFilterSidebar); };

  return (
    <>
      <div className="flex flex-col grow gap-y-8">
        <div className="rounded-md bg-background-alt p-8 flex justify-between items-center border-background-border border">
          <Title count={groupTotal} filter={filterName} />
          <div className="flex gap-x-2">
            <OptionButton onClick={toggleFilters} icon={mdiFilterOutline} />
            <OptionButton onClick={toggleMode} icon={mode === 'grid' ? mdiFormatListText : mdiViewGridOutline} />
            <OptionButton onClick={() => setShowFilterModal(true)} icon={mdiCogOutline} />
          </div>
        </div>
        <div className="flex grow">
          <CollectionView mode={mode} setGroupTotal={setGroupTotal} />
          <div className={cx('flex items-start overflow-hidden transition-all', showFilterSidebar ? 'w-[25.9375rem] opacity-100 ml-8' : 'w-0 opacity-0')}>
            <div className="rounded bg-background-alt p-8 flex grow border-background-border border justify-center items-center line-clamp-1">Filter sidebar</div>
          </div>
        </div>
      </div>
      <FiltersModal show={showFilterModal} onClose={() => setShowFilterModal(false)} />
    </>
  );
}

export default Collection;
