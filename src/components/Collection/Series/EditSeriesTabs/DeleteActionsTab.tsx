import React from 'react';
import { useTranslation } from 'react-i18next';

import Action from '@/components/Collection/Series/EditSeriesTabs/Action';
import toast from '@/components/Toast';
import { useDeleteSeriesMutation } from '@/core/react-query/series/mutations';
import useNavigateVoid from '@/hooks/useNavigateVoid';

type Props = {
  seriesId: number;
};

const DeleteActionsTab = ({ seriesId }: Props) => {
  const { t } = useTranslation('series');
  const navigate = useNavigateVoid();

  const { mutate: deleteSeries } = useDeleteSeriesMutation();

  const navigateToCollection = () => navigate('/webui/collection');

  return (
    <div className="flex grow flex-col gap-y-4 overflow-y-auto">
      <Action
        name={t('actions.delete.keepFiles.name')}
        description={t('actions.delete.keepFiles.description')}
        onClick={() =>
          deleteSeries({ seriesId, deleteFiles: false }, {
            onSuccess: () => {
              toast.success(t('toast.delete.keep'));
              navigateToCollection();
            },
          })}
      />
      <Action
        name={t('actions.delete.removeFiles.name')}
        description={t('actions.delete.removeFiles.description')}
        onClick={() =>
          deleteSeries({ seriesId, deleteFiles: true }, {
            onSuccess: () => {
              toast.success(t('toast.delete.remove'));
              navigateToCollection();
            },
          })}
      />
      <Action
        name={t('actions.delete.complete.name')}
        description={t('actions.delete.complete.description')}
        onClick={() =>
          deleteSeries({ seriesId, deleteFiles: true, completelyRemove: true }, {
            onSuccess: () => {
              toast.success(t('toast.delete.complete'));
              navigateToCollection();
            },
          })}
      />
    </div>
  );
};

export default DeleteActionsTab;
