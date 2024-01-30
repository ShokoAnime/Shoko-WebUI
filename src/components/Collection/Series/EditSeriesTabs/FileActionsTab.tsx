import React from 'react';

import Action from '@/components/Collection/Series/EditSeriesTabs/Action';
import toast from '@/components/Toast';
import { useRehashSeriesFilesMutation, useRescanSeriesFilesMutation } from '@/core/react-query/series/mutations';

type Props = {
  seriesId: number;
};

const FileActionsTab = ({ seriesId }: Props) => {
  const { mutate: rehashSeriesFiles } = useRehashSeriesFilesMutation();
  const { mutate: rescanSeriesFiles } = useRescanSeriesFilesMutation();

  return (
    <div className="flex h-[22rem] grow flex-col gap-y-4 overflow-y-auto">
      <Action
        name="Rescan Files"
        description="Rescans every file associated with the series."
        onClick={() =>
          rescanSeriesFiles(seriesId, {
            onSuccess: () => toast.success('Series files rescan queued!'),
          })}
      />
      <Action
        name="Rehash Files"
        description="Rehashes every file associated with the series."
        onClick={() =>
          rehashSeriesFiles(seriesId, {
            onSuccess: () => toast.success('Series files rehash queued!'),
          })}
      />
    </div>
  );
};

export default FileActionsTab;
