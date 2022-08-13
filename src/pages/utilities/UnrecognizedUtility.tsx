import React, { useState } from 'react';
import { Icon } from '@mdi/react';
import {
  mdiChevronRight,
} from '@mdi/js';
import cx from 'classnames';

import UnrecognizedTab from './UnrecognizedUtilityTabs/UnrecognizedTab';
import AVDumpTab from './UnrecognizedUtilityTabs/AVDumpTab.';

import { useGetFileUnrecognizedQuery } from '../../core/rtkQuery/fileApi';

function UnrecognizedUtility() {
  const files = useGetFileUnrecognizedQuery({ pageSize: 0 });

  const [activeTab, setActiveTab] = useState('unrecognized');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'unrecognized':
        return (<UnrecognizedTab />);
      case 'avdump':
        return (<AVDumpTab />);
      case 'manuallyLinked':
        return (<UnrecognizedTab />);
      case 'ignoredFiles':
        return (<UnrecognizedTab />);
      default:
        return (<UnrecognizedTab />);
    }
  };

  const renderTabButton = (key: string, name: string) => (
    <div onClick={() => setActiveTab(key)} className={cx(['mx-2 cursor-pointer', activeTab === key && 'text-highlight-1'])}>{name}</div>
  );

  return (
    <React.Fragment>

      <div className="flex items-center font-semibold">
        Unrecognized Files
        <Icon path={mdiChevronRight} size={1} className="ml-2" />
        {renderTabButton('unrecognized', 'Unrecognized')}
        <div>|</div>
        {renderTabButton('avdump', 'AVDump')}
        <div>|</div>
        {renderTabButton('manuallyLinked', 'Manually Linked')}
        <div>|</div>
        {renderTabButton('ignoredFiles', 'Ignored Files')}
        <div className="ml-auto">
          <span className="text-highlight-2">{files.data?.Total}</span> Files
        </div>
      </div>

      <div className="bg-background-border my-4 h-0.5 flex-shrink-0" />

      {renderTabContent()}

    </React.Fragment>
  );
}

export default UnrecognizedUtility;
