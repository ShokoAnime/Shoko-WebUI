import ModalPanel from '../Panels/ModalPanel';
import cx from 'classnames';
import React, { useMemo, useState } from 'react';
import { forEach } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiChevronUp } from '@mdi/js';
import { CollectionFilterType } from '../../core/types/api/collection';
import { setStatus } from '../../core/slices/modals/actions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../core/store';

const actions = {
  anidb: {
    title: 'AniDB',
    data: [
      'download-missing-anidb-data',
      'sync-votes',
      'sync-mylist',
      'update-all-anidb-info',
      'update-anidb-calendar',
    ],
  },
  trakt: {
    title: 'Trakt',
    data: [
      'sync-trakt',
      'update-all-trakt-info',
    ],
  },
  tvdb: {
    title: 'The TvDB',
    data: [
      'regen-tvdb-links',
      'update-all-tvdb-info',
    ],
  },
  moviedb: {
    title: 'The MovieDB',
    data: [
      'update-all-moviedb-info',
    ],
  },
  shoko: {
    title: 'Shoko',
    data: [
      'avdump-mismatched-files',
      'recreate-all-groups',
      'sync-hashes',
      'update-all-mediainfo',
      'update-series-stats',
    ],
  },
  images: {
    title: 'Images',
    data: [
      'update-all-images',
      'validate-all-images',
    ],
  },
  plex: {
    title: 'Plex',
    data: [
      'plex-sync-all',
    ],
  },
  import: {
    title: 'Import',
    data: [
      'remove-missing-files-mylist',
      'remove-missing-files',
      'run-import',
    ],
  },
};

function ActionsModal() {
  const dispatch = useDispatch();
  const status = useSelector((state: RootState) => state.modals.actions.status);
  const [activeTab, setActiveTab] = useState('Filters');
  const handleClose = () => dispatch(setStatus(false));

  const renderItem = (item: CollectionFilterType) => (
    <div className="flex justify-between font-semibold">
      <span>{item.Name}</span>
      <span className="text-highlight-2">{item.Size}</span>
    </div>
  );

  const renderTab = (title, items) => (
    <React.Fragment>
      <div className="grow px-4 py-2 bg-background-alt self-stretch border-b border-background-border shadow flex justify-between">
        <p className="text-base font-semibold text-gray-300">{title}</p>
        <span onClick={() => { setActiveTab(title); }}><Icon className="cursor-pointer" path={mdiChevronUp} size={1} rotate={activeTab === title ? 0 : 180} /></span>
      </div>
      <div className={cx('flex flex-col grow w-full p-4', { hidden: activeTab !== title })}>
        <div className="box-border flex flex-col bg-background-alt border border-background-border items-center rounded-md px-3 py-2">
          <div className="flex flex-col w-full p-4 space-y-1 max-h-80 shoko-scrollbar overflow-y-auto">
            {items.map(item => renderItem(item))}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
  
  
  const renderTabs = useMemo(() => {
    const panels: React.ReactNode[] = [];
    forEach(actions, (action) => {
      panels.push(renderTab(action.title, action.data));
    });
    return panels;
  }, [actions]);
  
  return (
    <ModalPanel
      sidebarSnap
      show={status}
      className="pb-6"
      onRequestClose={() => handleClose()}
    >
      <div className="flex flex-col w-full border-l border-background-border drop-shadow-[4px_0_4px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col items-center justify-start bg-color-nav">
          {renderTabs}
        </div>
      </div>
    </ModalPanel>
  );
}

export default ActionsModal;