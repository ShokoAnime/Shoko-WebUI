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

const invalidateManagedFolders = debounce(
  () => invalidateQueries(['managed-folder']),
  1000,
);

const invalidateQueueItems = debounce(
  () => invalidateQueries(['queue', 'items']),
  500,
);

// Series updated within the debounce window, refreshed together when it ends.
const pendingSeriesIds = new Set<number>();

const flushSeries = debounce(
  () => {
    pendingSeriesIds.forEach((seriesId) => {
      invalidateQueries(['series', seriesId]);
      invalidateQueries(['webui', 'series-overview', seriesId]);
    });
    pendingSeriesIds.clear();
  },
  1000,
);

const invalidateSeries = (seriesIds: number[]) => {
  seriesIds.forEach(seriesId => pendingSeriesIds.add(seriesId));
  flushSeries();
};

const invalidateUtilities = debounce(
  () => {
    invalidateQueries(['release-management']);
    invalidateQueries(['duplicate-files']);
    invalidateQueries(['missing-episodes']);
  },
  2000,
);

export const handleEvent = (event: string, data?: SeriesUpdateEventType) => {
  switch (event) {
    case 'FileDeleted':
    case 'FileDetected':
    case 'FileHashed':
    case 'FileMatched':
      invalidateDashboard();
      invalidateFiles();
      invalidateManagedFolders();
      if (event === 'FileDeleted' || event === 'FileMatched') invalidateUtilities();
      break;
    case 'FileMoved':
      invalidateFiles();
      invalidateManagedFolders();
      break;
    case 'FileRenamed':
      invalidateFiles();
      break;
    case 'QueueStateChanged':
      invalidateQueueItems();
      break;
    case 'SeriesUpdated':
      invalidateDashboard();
      invalidateManagedFolders();
      if (data?.ShokoSeriesIDs) invalidateSeries(data.ShokoSeriesIDs);
      break;
    default:
  }
};
