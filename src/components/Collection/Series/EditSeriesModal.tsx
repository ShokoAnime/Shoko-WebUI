import React, { useState } from 'react';
import cx from 'classnames';
import { map } from 'lodash';

import DeleteActionsTab from '@/components/Collection/Series/EditSeriesTabs/DeleteActionsTab';
import FileActionsTab from '@/components/Collection/Series/EditSeriesTabs/FileActionsTab';
import NameTab from '@/components/Collection/Series/EditSeriesTabs/NameTab';
import UpdateActionsTab from '@/components/Collection/Series/EditSeriesTabs/UpdateActionsTab';
import ModalPanel from '@/components/Panels/ModalPanel';
// TODO: Add tabs after implementing back-end endpoint for GroupTab and PersonalStats
// import GroupTab from './EditSeriesTabs/GroupTab';
// import PersonalStats from './EditSeriesTabs/PersonalStats';

type Props = {
  show: boolean;
  onClose: () => void;
  seriesId: number;
};

const tabs = {
  // name: 'Name',
  // group: 'Group',
  // stats: 'Personal Stats',
  update_actions: 'Update Actions',
  file_actions: 'File Actions',
  delete_actions: 'Delete Actions',
};

const renderTab = (activeTab: string, seriesId: number) => {
  switch (activeTab) {
    case 'update_actions':
      return <UpdateActionsTab seriesId={seriesId} />;
    case 'file_actions':
      return <FileActionsTab seriesId={seriesId} />;
    case 'delete_actions':
      return <DeleteActionsTab seriesId={seriesId} />;
    // case 'group':
    //   return <GroupTab seriesId={seriesId} />;
    // case 'stats':
    //   return <PersonalStats />;
    case 'name':
    default:
      return <NameTab seriesId={seriesId} />;
  }
};

const EditSeriesModal = (props: Props) => {
  const { onClose, seriesId, show } = props;

  const [activeTab, setActiveTab] = useState('update_actions');

  return (
    <ModalPanel show={show} onRequestClose={onClose} header="Edit Series" size="md" noPadding noGap>
      <div className="flex h-[22rem] flex-row gap-x-6 p-6">
        <div className="flex shrink-0 gap-y-6 font-semibold">
          <div className="flex flex-col gap-y-1">
            {map(tabs, (value, key) => (
              <div
                className={cx(
                  activeTab === key
                    ? 'w-[12rem] text-center bg-panel-menu-item-background p-3 rounded-lg text-panel-menu-item-text cursor-pointer'
                    : 'w-[12rem] text-center p-3 rounded-lg hover:bg-panel-menu-item-background-hover cursor-pointer',
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
        <div>
          {renderTab(activeTab, seriesId)}
        </div>
      </div>
    </ModalPanel>
  );
};

export default EditSeriesModal;
