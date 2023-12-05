import React, { useState } from 'react';
import cx from 'classnames';
import { map } from 'lodash';

import NameTab from '@/components/Collection/Series/EditSeriesTabs/NameTab';
import SeriesActionsTab from '@/components/Collection/Series/EditSeriesTabs/SeriesActionsTab';
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
  actions: 'Series Actions',
};

const renderTab = (activeTab: string, seriesId: number) => {
  switch (activeTab) {
    case 'actions':
      return <SeriesActionsTab seriesId={seriesId} />;
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

  const [activeTab, setActiveTab] = useState('actions');

  return (
    <ModalPanel show={show} onRequestClose={onClose} title="Edit Series" noPadding titleLeft>
      <div className="flex">
        <div className="flex w-[12rem] shrink-0 flex-col gap-y-8 border-r border-panel-border p-8 font-semibold">
          {map(tabs, (value, key) => (
            <div
              className={cx('font-semibold cursor-pointer', activeTab === key && 'text-panel-text-primary')}
              key={key}
              onClick={() => setActiveTab(key)}
            >
              {value}
            </div>
          ))}
        </div>
        <div className="w-full p-8">
          {renderTab(activeTab, seriesId)}
        </div>
      </div>
    </ModalPanel>
  );
};

export default EditSeriesModal;
