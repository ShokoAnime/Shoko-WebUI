import React, { useState } from 'react';
import { useParams } from 'react-router';
import { mdiCogOutline, mdiFilterOutline, mdiFormatListText, mdiViewGridOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import CollectionTitle from '@/components/Collection/CollectionTitle';
import CollectionView from '@/components/Collection/CollectionView';
import FiltersModal from '@/components/Dialogs/FiltersModal';
import { useGetFilterQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';

const OptionButton = ({ icon, onClick }) => (
  <div
    className="cursor-pointer rounded border border-panel-border bg-button-secondary px-5 py-2 drop-shadow-md"
    onClick={onClick}
  >
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
  const toggleFilters = () => {
    setShowFilterSidebar(!showFilterSidebar);
  };

  return (
    <>
      <div className="flex grow flex-col gap-y-8">
        <div className="flex items-center justify-between rounded-md border border-panel-border bg-panel-background p-8">
          <CollectionTitle count={groupTotal} filterOrGroup={filterName} />
          <div className="flex gap-x-2">
            <OptionButton onClick={toggleFilters} icon={mdiFilterOutline} />
            <OptionButton onClick={toggleMode} icon={mode === 'grid' ? mdiFormatListText : mdiViewGridOutline} />
            <OptionButton onClick={() => setShowFilterModal(true)} icon={mdiCogOutline} />
          </div>
        </div>
        <div className="flex grow">
          <CollectionView mode={mode} setGroupTotal={setGroupTotal} />
          <div
            className={cx(
              'flex items-start overflow-hidden transition-all',
              showFilterSidebar ? 'w-[25.9375rem] opacity-100 ml-8' : 'w-0 opacity-0',
            )}
          >
            <div className="line-clamp-1 flex grow items-center justify-center rounded border border-panel-border bg-panel-background p-8">
              Filter sidebar
            </div>
          </div>
        </div>
      </div>
      <FiltersModal show={showFilterModal} onClose={() => setShowFilterModal(false)} />
    </>
  );
}

export default Collection;
