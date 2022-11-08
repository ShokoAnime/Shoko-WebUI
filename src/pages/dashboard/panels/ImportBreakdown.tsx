import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import UnrecognizedTab from './ImportBreakdownTabs/UnrecognizedTab';

import { useGetFileUnrecognizedQuery } from '../../../core/rtkQuery/fileApi';

function ImportBreakdown() {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const items = useGetFileUnrecognizedQuery({ pageSize: 0 });

  return (
    <ShokoPanel title="Unrecognized" isFetching={items.isLoading} disableClick={layoutEditMode}>
      <UnrecognizedTab />
    </ShokoPanel>
  );
}

export default ImportBreakdown;
