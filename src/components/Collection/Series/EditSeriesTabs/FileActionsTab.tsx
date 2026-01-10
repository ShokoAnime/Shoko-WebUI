import React from 'react';
import { useTranslation } from 'react-i18next';

import Action from '@/components/Collection/Series/EditSeriesTabs/Action';
import toast from '@/components/Toast';
import {
  useRehashSeriesFilesMutation,
  useRelocateSeriesFilesMutation,
  useRescanSeriesFilesMutation,
} from '@/core/react-query/series/mutations';
import useIsFeatureSupported, { FeatureType } from '@/hooks/useIsFeatureSupported';

type Props = {
  seriesId: number;
};

const FileActionsTab = ({ seriesId }: Props) => {
  const { t } = useTranslation('series');
  const { mutate: rehashSeriesFiles } = useRehashSeriesFilesMutation(seriesId);
  const { mutate: rescanSeriesFiles } = useRescanSeriesFilesMutation(seriesId);
  const { mutate: relocateSeriesFiles } = useRelocateSeriesFilesMutation(seriesId);
  const showUnsupportedToast = () => {
    toast.error(`This feature requires server version >= ${FeatureType.RelocateSeriesFiles}`);
  };

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
      <Action
        name="Rename/Move Files"
        description="Rename/Move every file associated with the group."
        onClick={useIsFeatureSupported(FeatureType.RelocateSeriesFiles) ? relocateSeriesFiles : showUnsupportedToast}
      />
    </div>
  );
};

export default FileActionsTab;
