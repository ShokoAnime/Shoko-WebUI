import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@mdi/react';
import {
  mdiChevronRight,
} from '@mdi/js';
import cx from 'classnames';

import type { RootState } from '../../core/store';

import UnrecognizedTab from './UnrecognizedUtilityTabs/UnrecognizedTab';

function UnrecognizedUtility() {
  const files = useSelector((state: RootState) => state.mainpage.unrecognizedFiles);

  const [activeTab, setActiveTab] = useState('unrecognized');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'unrecognized':
        return (<UnrecognizedTab files={files} />);
      case 'avdump':
        return (<UnrecognizedTab files={files} />);
      case 'manuallyLinked':
        return (<UnrecognizedTab files={files} />);
      case 'ignoredFiles':
        return (<UnrecognizedTab files={files} />);
      default:
        return (<UnrecognizedTab files={files} />);
    }
  };

  const renderTabButton = (key: string, name: string) => (
    <div onClick={() => setActiveTab(key)} className={cx(['mx-2 cursor-pointer', activeTab === key && 'text-primary'])}>{name}</div>
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
          <span className="text-highlight-2">{files.length}</span> Files
        </div>
      </div>

      <div className="bg-background-border my-4 h-0.5 flex-shrink-0" />

      {renderTabContent()}

    </React.Fragment>
  );
}

export default UnrecognizedUtility;
