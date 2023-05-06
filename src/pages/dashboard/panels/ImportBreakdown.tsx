import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import UnrecognizedTab from './ImportBreakdownTabs/UnrecognizedTab';

import { useGetFileUnrecognizedQuery } from '../../../core/rtkQuery/splitV3Api/fileApi';

function ImportBreakdown() {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const items = useGetFileUnrecognizedQuery({ pageSize: 0 });

  return (
    <ShokoPanel title="Unrecognized Files" isFetching={items.isLoading} editMode={layoutEditMode}>
      <UnrecognizedTab />
    </ShokoPanel>
  );
}

export default ImportBreakdown;
