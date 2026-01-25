import React from 'react';

import Action from '@/components/Collection/Series/EditSeriesTabs/Action';
import {
  useRehashSeriesFilesMutation,
  useRelocateSeriesFilesMutation,
  useRescanSeriesFilesMutation,
} from '@/core/react-query/series/mutations';

type Props = {
  seriesId: number;
};

const FileActionsTab = ({ seriesId }: Props) => {
  const { mutate: rehashSeriesFiles } = useRehashSeriesFilesMutation(seriesId);
  const { mutate: rescanSeriesFiles } = useRescanSeriesFilesMutation(seriesId);
  const { mutate: relocateSeriesFiles } = useRelocateSeriesFilesMutation(seriesId);

  return (
    <div className="flex h-88 grow flex-col gap-y-4 overflow-y-auto">
      <Action
        name="Rescan Files"
        description="Rescans every file associated with the series."
        onClick={rescanSeriesFiles}
      />
      <Action
        name="Rehash Files"
        description="Rehashes every file associated with the series."
        onClick={rehashSeriesFiles}
      />
      <Action
        name="Rename/Move Files"
        description="Rename/Move every file associated with the group."
        onClick={relocateSeriesFiles}
      />
    </div>
  );
};

export default FileActionsTab;
