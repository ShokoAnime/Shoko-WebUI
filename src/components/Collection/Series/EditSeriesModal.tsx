import React, { useState } from 'react';
import cx from 'classnames';
import { map } from 'lodash';

import NameTab from '@/components/Collection/Series/EditSeriesTabs/NameTab';
import SeriesActionsTab from '@/components/Collection/Series/EditSeriesTabs/SeriesActionsTab';
import ModalPanel from '@/components/Panels/ModalPanel';

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
    case 'name':
    default:
      return <NameTab seriesId={seriesId} />;
  }
};

const EditSeriesModal = (props: Props) => {
  const { onClose, seriesId, show } = props;

  const [activeTab, setActiveTab] = useState('actions');

  return (
    <ModalPanel show={show} onRequestClose={onClose} title="Edit Series">
      <div className="flex">
        <div className="flex min-w-[10rem] flex-col gap-y-4 border-r-2 border-panel-border">
          {map(tabs, (value, key) => (
            <div
              className={cx('font-semibold cursor-pointer', activeTab === key && 'text-panel-primary')}
              key={key}
              onClick={() => setActiveTab(key)}
            >
              {value}
            </div>
          ))}
        </div>
        <div className="ml-8 w-full">
          {renderTab(activeTab, seriesId)}
        </div>
      </div>
    </ModalPanel>
  );
};

export default EditSeriesModal;
