import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';
import { map } from 'lodash';

import DeleteActionsTab from '@/components/Collection/Series/EditSeriesTabs/DeleteActionsTab';
import FileActionsTab from '@/components/Collection/Series/EditSeriesTabs/FileActionsTab';
import GroupTab from '@/components/Collection/Series/EditSeriesTabs/GroupTab';
import NameTab from '@/components/Collection/Series/EditSeriesTabs/NameTab';
import UpdateActionsTab from '@/components/Collection/Series/EditSeriesTabs/UpdateActionsTab';
import ModalPanel from '@/components/Panels/ModalPanel';
import { setSeriesId } from '@/core/slices/modals/editSeries';

import type { RootState } from '@/core/store';

// TODO: Add tabs after implementing back-end endpoint for PersonalStats
// import PersonalStats from '@/components/Collection/Series/EditSeriesTabs/PersonalStats';

const tabs = {
  name: 'Name',
  group: 'Group',
  update_actions: 'Update Actions',
  file_actions: 'File Actions',
  delete_actions: 'Delete Actions',
  // stats: 'Personal Stats',
};

const renderTab = (activeTab: string, seriesId = -1) => {
  if (seriesId === -1) return null;
  switch (activeTab) {
    case 'name':
      return <NameTab seriesId={seriesId} />;
    case 'file_actions':
      return <FileActionsTab seriesId={seriesId} />;
    case 'delete_actions':
      return <DeleteActionsTab seriesId={seriesId} />;
    case 'group':
      return <GroupTab seriesId={seriesId} />;
    // case 'stats':
    //   return <PersonalStats />;
    case 'update_actions':
    default:
      return <UpdateActionsTab seriesId={seriesId} />;
  }
};

const EditSeriesModal = () => {
  const dispatch = useDispatch();

  const seriesId = useSelector((state: RootState) => state.modals.editSeries.seriesId);

  const onClose = useCallback(() => {
    if (seriesId === -1) return;
    dispatch(setSeriesId(-1));
  }, [dispatch, seriesId]);

  useEffect(() => onClose, [onClose]);

  const [activeTab, setActiveTab] = useState('name');

  return (
    <ModalPanel show={seriesId !== -1} onRequestClose={onClose} header="Edit Series" size="md" noPadding noGap>
      <div className="flex h-[26rem] flex-row gap-x-6 p-6">
        <div className="flex shrink-0 gap-y-6 font-semibold">
          <div className="flex flex-col gap-y-1">
            {map(tabs, (value, key) => (
              <div
                className={cx(
                  activeTab === key
                    ? 'w-[12rem] text-center bg-panel-menu-item-background p-3 rounded-lg text-panel-menu-item-text cursor-pointer'
                    : 'w-[12rem] text-center p-3 rounded-lg hover:bg-panel-menu-item-background-hover cursor-pointer transition-colors',
                )}
                key={key}
                onClick={() => setActiveTab(key)}
              >
                {value}
              </div>
            ))}
          </div>
        </div>
        <div className="border-r border-panel-border" />
        <div className="grow">
          {renderTab(activeTab, seriesId)}
        </div>
      </div>
    </ModalPanel>
  );
};

export default EditSeriesModal;
