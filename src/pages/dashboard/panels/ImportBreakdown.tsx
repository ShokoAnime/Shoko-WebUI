import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import Button from '../../../components/Input/Button';
import ImportedTab from './ImportBreakdownTabs/ImportedTab';
import UnrecognizedTab from './ImportBreakdownTabs/UnrecognizedTab';

function ImportBreakdown() {
  const hasFetchedRecents = useSelector((state: RootState) => state.mainpage.fetched.recentFiles);
  const hasFetchedUnrecognized = useSelector(
    (state: RootState) => state.mainpage.fetched.unrecognizedFiles,
  );

  const [activeTab, setActiveTab] = useState('unrecognized');

  const renderOptions = () => (
    <div className="font-open-sans font-semibold">
      <Button onClick={() => setActiveTab('imported')} className={cx(['mr-2 font-open-sans font-semibold', activeTab === 'imported' && 'color-highlight-1'])}>
        Imported
      </Button>
      <Button onClick={() => setActiveTab('unrecognized')} className={cx(['mr-2 font-open-sans font-semibold', activeTab === 'unrecognized' && 'color-highlight-1'])}>
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
        return <UnrecognizedTab />;
    }
  };

  return (
    // <ShokoPanel title="Unrecognized" options={renderOptions()} isFetching={!(activeTab === 'unrecognized' ? hasFetchedUnrecognized : hasFetchedRecents)}>
    <ShokoPanel title="Unrecognized" isFetching={!(activeTab === 'unrecognized' ? hasFetchedUnrecognized : hasFetchedRecents)}>
      {renderContent()}
    </ShokoPanel>
  );
}

export default ImportBreakdown;
