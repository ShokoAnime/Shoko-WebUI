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

const invalidateQueueItems = debounce(
  () => invalidateQueries(['queue', 'items']),
  500,
);

const invalidateReleaseManagement = debounce(
  () => invalidateQueries(['release-management']),
  5000,
);

const invalidateSeries = debounce(
  (seriesIds: number[]) =>
    seriesIds.forEach((seriesId) => {
      invalidateQueries(['series', seriesId]);
      invalidateQueries(['webui', 'series-overview', seriesId]);
    }),
  1000,
);

export const handleEvent = (event: string, data?: SeriesUpdateEventType) => {
  switch (event) {
    case 'FileDeleted':
    case 'FileDetected':
    case 'FileHashed':
    case 'FileMatched':
      invalidateDashboard();
      invalidateFiles();
      invalidateImportFolders();
      invalidateReleaseManagement();
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
      if (data?.ShokoSeriesIDs) invalidateSeries(data.ShokoSeriesIDs);
      break;
    default:
  }
};
