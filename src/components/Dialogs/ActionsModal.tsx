import React, { useMemo, useState } from 'react';
import cx from 'classnames';
import { forEach } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiChevronUp, mdiPlayCircleOutline } from '@mdi/js';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import ModalPanel from '../Panels/ModalPanel';
import quickActions from '../../core/quick-actions';
import { setStatus } from '../../core/slices/modals/actions';
import { useRunActionMutation } from '../../core/rtkQuery/actionsApi';

import { RootState } from '../../core/store';

const actions = {
  import: {
    title: 'Import',
    data: [
      'remove-missing-files-mylist',
      'remove-missing-files',
      'run-import',
    ],
  },
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
};

function ActionsModal() {
  const dispatch = useDispatch();
  const status = useSelector((state: RootState) => state.modals.actions.status);
  const [activeTab, setActiveTab] = useState('Import');
  const handleClose = () => dispatch(setStatus(false));

  const [runActionTrigger] = useRunActionMutation();
  
  const runAction = async (action) => {
    //TODO: figure out better type for this
    const result: any = await runActionTrigger(action);
    if (!result.error) {
      toast.success('Request Sent!');
    }
  };

  const renderItem = (item: { name: string; function: string; data?:boolean; }) => (
    <div className="flex justify-between font-semibold">
      <span>{item.name}</span>
      <span className="text-highlight-1" onClick={() => runAction(item.function)}><Icon className="cursor-pointer" path={mdiPlayCircleOutline} size={1} /></span>
    </div>
  );

  const renderTab = (title, items) => (
    <React.Fragment>
      <div className="grow px-4 py-2 bg-background-alt self-stretch border-b border-background-border shadow flex justify-between">
        <p className="text-base font-semibold text-gray-300">{title}</p>
        <span onClick={() => { setActiveTab(title); }}><Icon className="cursor-pointer" path={mdiChevronUp} size={1} rotate={activeTab === title ? 0 : 180} /></span>
      </div>
      <div className={cx('flex flex-col grow w-full p-4 space-y-1', { hidden: activeTab !== title })}>
        {items.map(item => renderItem(quickActions[item]))}
      </div>
    </React.Fragment>
  );
  
  
  const renderTabs = useMemo(() => {
    const panels: React.ReactNode[] = [];
    forEach(actions, (action) => {
      panels.push(renderTab(action.title, action.data));
    });
    return panels;
  }, [actions, activeTab]);
  
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