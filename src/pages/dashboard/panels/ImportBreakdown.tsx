import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import UnrecognizedTab from './ImportBreakdownTabs/UnrecognizedTab';

function ImportBreakdown() {
  const hasFetchedUnrecognized = useSelector(
    (state: RootState) => state.mainpage.fetched.unrecognizedFiles,
  );

  return (
    <ShokoPanel title="Unrecognized" isFetching={!hasFetchedUnrecognized}>
      <UnrecognizedTab />
    </ShokoPanel>
  );
}

export default ImportBreakdown;
