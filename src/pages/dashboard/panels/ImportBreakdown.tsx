import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import { RootState } from '../../../core/store';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Input/Button';
import ImportedTab from './ImportBreakdownTabs/ImportedTab';
import UnrecognizedTab from './ImportBreakdownTabs/UnrecognizedTab';

function ImportBreakdown() {
  const hasFetchedRecents = useSelector((state: RootState) => state.mainpage.fetched.recentFiles);
  const hasFetchedUnrecognized = useSelector(
    (state: RootState) => state.mainpage.fetched.unrecognizedFiles,
  );

  const [activeTab, setActiveTab] = useState('imported');

  const renderOptions = () => (
    <div className="font-mulish font-bold">
      <Button onClick={() => setActiveTab('imported')} className={cx(['mr-2 font-mulish font-bold', activeTab === 'imported' && 'color-highlight-1'])}>
        Imported
      </Button>
      <Button onClick={() => setActiveTab('unrecognized')} className={cx(['mr-2 font-mulish font-bold', activeTab === 'unrecognized' && 'color-highlight-1'])}>
        Unrecognized
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'imported':
        return <ImportedTab />;
      case 'unrecognized':
        return <UnrecognizedTab />;
      default:
        return <ImportedTab />;
    }
  };

  return (
    <FixedPanel title="Import Breakdown" options={renderOptions()} isFetching={!(activeTab === 'unrecognized' ? hasFetchedUnrecognized : hasFetchedRecents)}>
      {renderContent()}
    </FixedPanel>
  );
}

export default ImportBreakdown;
