import React from 'react';

import Action from '@/components/Collection/Series/EditSeriesTabs/Action';
import toast from '@/components/Toast';
import { useDeleteSeriesMutation } from '@/core/react-query/series/mutations';
import useNavigateVoid from '@/hooks/useNavigateVoid';

type Props = {
  seriesId: number;
};

const DeleteActionsTab = ({ seriesId }: Props) => {
  const navigate = useNavigateVoid();

  const { mutate: deleteSeries } = useDeleteSeriesMutation();

  const navigateToCollection = () => navigate('/webui/collection');

  return (
    <div className="flex grow flex-col gap-y-4 overflow-y-auto">
      <Action
        name="Delete Series - Keep Files"
        description="Deletes the series from Shoko but does not delete the files"
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
        name="Delete Series - Complete"
        description="Removes all records relating to the series. Use with caution, as you may get banned if it's abused"
        onClick={() =>
          deleteSeries({ seriesId, deleteFiles: true, completelyRemove: true }, {
            onSuccess: () => {
              toast.success('Series deleted completely!');
              navigateToCollection();
            },
          })}
      />
    </div>
  );
};

export default DeleteActionsTab;
