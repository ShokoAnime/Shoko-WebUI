import React from 'react';
import { useTranslation } from 'react-i18next';

import Action from '@/components/Collection/Series/EditSeriesTabs/Action';
import { useRehashSeriesFilesMutation, useRescanSeriesFilesMutation } from '@/core/react-query/series/mutations';

type Props = {
  seriesId: number;
};

const FileActionsTab = ({ seriesId }: Props) => {
  const { t } = useTranslation('series');
  const { mutate: rehashSeriesFiles } = useRehashSeriesFilesMutation(seriesId);
  const { mutate: rescanSeriesFiles } = useRescanSeriesFilesMutation(seriesId);

  return (
    <div className="flex h-[22rem] grow flex-col gap-y-4 overflow-y-auto">
      <Action
        name={t('actions.file.rescan.name')}
        description={t('actions.file.rescan.description')}
        onClick={rescanSeriesFiles}
      />
      <Action
        name={t('actions.file.rehash.name')}
        description={t('actions.file.rehash.description')}
        onClick={rehashSeriesFiles}
      />
    </div>
  );
};

export default FileActionsTab;
