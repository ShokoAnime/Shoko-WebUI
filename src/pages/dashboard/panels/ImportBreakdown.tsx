import React from 'react';

import ShokoPanel from '../../../components/Panels/ShokoPanel';
import UnrecognizedTab from './ImportBreakdownTabs/UnrecognizedTab';

import { useGetFileUnrecognizedQuery } from '../../../core/rtkQuery/fileApi';

function ImportBreakdown() {
  const items = useGetFileUnrecognizedQuery({ pageSize: 0 });

  return (
    <ShokoPanel title="Unrecognized" isFetching={items.isLoading}>
      <UnrecognizedTab />
    </ShokoPanel>
  );
}

export default ImportBreakdown;
