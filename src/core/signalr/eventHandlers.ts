import { debounce } from 'lodash';

import { invalidateQueries } from '@/core/react-query/queryClient';

import type { SeriesUpdateEventType } from '@/core/signalr/types';

const invalidateDashboard = debounce(
  () => invalidateQueries(['dashboard']),
  1000,
);

const invalidateFiles = debounce(
  () => invalidateQueries(['files']),
  1000,
);

const invalidateImportFolders = debounce(
  () => invalidateQueries(['import-folder']),
  1000,
);

// Should we add a debounce here? It seems to work fine without it
const invalidateQueueItems = () => invalidateQueries(['queue', 'items']);

const invalidateSeries = debounce(
  (seriesId: number, groupIds: number[]) => {
    invalidateQueries(['series', seriesId]);
    invalidateQueries(['webui', 'series-overview', seriesId]);

    groupIds.forEach(groupId => invalidateQueries(['group', groupId]));
  },
  1000,
);

export const handleEvent = (event: string, data?: SeriesUpdateEventType) => {
  switch (event) {
    case 'FileDeleted':
    case 'FileMatched':
      invalidateDashboard();
      invalidateFiles();
      invalidateImportFolders();
      break;
    case 'FileMoved':
      invalidateFiles();
      invalidateImportFolders();
      break;
    case 'FileRenamed':
      invalidateFiles();
      break;
    case 'QueueStateChanged':
      invalidateQueueItems();
      break;
    case 'SeriesUpdated':
      invalidateDashboard();
      invalidateImportFolders();
      if (!data?.ShokoGroupIDs || !data?.ShokoSeriesIDs) return;
      invalidateSeries(data.ShokoSeriesIDs[0], data.ShokoGroupIDs);
      break;
    default:
  }
};
