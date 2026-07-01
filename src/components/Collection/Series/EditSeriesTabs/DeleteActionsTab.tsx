import React, { useState } from 'react';

import Action from '@/components/Collection/Series/EditSeriesTabs/Action';
import { useDeleteSeriesMutation } from '@/core/react-query/series/mutations';
import toast from '@/core/toast';
import useNavigateVoid from '@/hooks/useNavigateVoid';
import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';

type Props = {
  seriesId: number;
};

const DeleteActionsTab = ({ seriesId }: Props) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigateVoid();

  const { isPending: deletePending, mutate: deleteSeries } = useDeleteSeriesMutation();

  const navigateToCollection = () => navigate('/webui/collection');

  const handleDelete = () => {
    if (!showConfirmModal || deletePending) return;
    deleteSeries({ seriesId, deleteFiles: true, completelyRemove: true }, {
      onSuccess: () => {
        toast.success('Series deleted completely!');
        navigateToCollection();
      },
    });
  };

  return (
    <div className="flex grow flex-col gap-y-4 overflow-y-auto">
      <Action
        name="Delete Series - Keep Files"
        description="Deletes the series from Shoko but does not delete the files. Cached AniDB data is preserved."
        onClick={() =>
          deleteSeries({ seriesId, deleteFiles: false }, {
            onSuccess: () => {
              toast.success('Series deleted!');
              navigateToCollection();
            },
          })}
      />
      <Action
        name="Delete Series - Remove Files"
        description="Deletes the series from Shoko along with the files"
        onClick={() =>
          deleteSeries({ seriesId, deleteFiles: true }, {
            onSuccess: () => {
              toast.success('Series and files deleted!');
              navigateToCollection();
            },
          })}
      />
      <Action
        name="Delete Series - All Series Data and Files"
        description="Removes ALL DATA AND FILES relating to the series. Use with caution, as you may get temp banned from AniDB if it's abused"
        onClick={() => setShowConfirmModal(true)}
      />
      <ConfirmationPromptModal
        show={showConfirmModal}
        title="Confirm delete ALL SERIES DATA AND FILES"
        onConfirm={handleDelete}
        onClose={() => setShowConfirmModal(false)}
        confirmText="Delete"
        confirmButtonType="danger"
      >
        <div>
          Are you sure you want to delete ALL SERIES DATA AND FILES ?
        </div>
      </ConfirmationPromptModal>
    </div>
  );
};

export default DeleteActionsTab;
