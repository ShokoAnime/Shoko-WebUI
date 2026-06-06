import React, { useMemo, useState } from 'react';
import { mdiLoading, mdiRefresh, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useToggle } from 'usehooks-ts';

import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';
import Button from '@/components/Input/Button';
import RepositoryModal from '@/components/Settings/PluginManagement/Dialogs/RepositoryModal';
import toast from '@/components/Toast';
import {
  useDeletePluginPackageRepositoryMutation,
  useSyncAllPluginPackageRepositoriesMutation,
  useSyncPluginPackageRepositoryMutation,
} from '@/core/react-query/plugin-package/mutations';
import { usePluginPackageRepositoriesQuery } from '@/core/react-query/plugin-package/queries';
import { dayjs } from '@/core/util';

import type { PackageRepositoryInfoType } from '@/core/types/api/plugin-package';

const RepositoryCard = ({ repository }: { repository: PackageRepositoryInfoType }) => {
  const { isPending: isSyncPending, mutate: syncRepository } = useSyncPluginPackageRepositoryMutation();
  const { isPending: isDeletePending, mutateAsync: deleteRepository } = useDeletePluginPackageRepositoryMutation();

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSync = () => {
    syncRepository(repository.ID, {
      onSuccess: () => toast.success('Repository synchronized', repository.Name),
      onError: () => toast.error('Failed to synchronize repository', repository.Name),
    });
  };

  const handleDelete = async () => {
    await deleteRepository(repository.ID)
      .then(() => toast.success('Repository removed', repository.Name))
      .catch(() => toast.error('Failed to remove repository', repository.Name));
  };

  return (
    <>
      <div className="flex flex-col gap-y-4 rounded-lg border border-panel-border bg-panel-input p-4">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <div className="font-semibold">{repository.Name}</div>
            <div className="flex gap-x-2">
              <Button onClick={handleSync} disabled={isSyncPending} tooltip="Sync">
                <Icon path={mdiRefresh} size={0.8} spin={isSyncPending} />
              </Button>
              <Button onClick={() => setConfirmDelete(true)} disabled={isDeletePending} tooltip="Delete">
                <Icon path={mdiTrashCanOutline} size={0.8} className="text-panel-text-danger" />
              </Button>
            </div>
          </div>
          <div className="truncate text-sm opacity-65">{repository.Url}</div>
        </div>
        <div className="text-sm opacity-65">
          Last sync:&nbsp;
          {repository.LastFetchedAt ? dayjs(repository.LastFetchedAt).format('MMMM Do, YYYY HH:mm') : 'Never'}
        </div>
      </div>

      <ConfirmationPromptModal
        show={confirmDelete}
        title="Remove Plugin Repository"
        confirmButtonType="danger"
        confirmText="Remove"
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      >
        <div className="flex flex-wrap">
          Do you want to remove the repository&nbsp;
          <span className="font-semibold text-panel-text-important">{repository.Name}</span>
          ?
        </div>
      </ConfirmationPromptModal>
    </>
  );
};

type Props = {
  query: string;
};

const RepositoriesSection = ({ query }: Props) => {
  const repositoriesQuery = usePluginPackageRepositoriesQuery();
  const { isPending: isSyncAllPending, mutate: syncAll } = useSyncAllPluginPackageRepositoriesMutation();
  const [showRepositoryModal, toggleRepositoryModal] = useToggle(false);

  const repositories = useMemo(() => {
    if (!repositoriesQuery.data) return [];
    if (!query) return repositoriesQuery.data;

    const matchesQuery = (value: string) => value.toLowerCase().includes(query);

    return repositoriesQuery.data.filter(repository => [repository.Name, repository.Url].some(matchesQuery));
  }, [query, repositoriesQuery.data]);

  const handleSyncAll = () => {
    syncAll(undefined, {
      onSuccess: () => toast.success('Repositories synchronized'),
      onError: () => toast.error('Failed to synchronize repositories'),
    });
  };

  if (repositoriesQuery.isPending) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} spin size={4} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex justify-end gap-x-3">
        <Button
          buttonType="secondary"
          buttonSize="normal"
          onClick={toggleRepositoryModal}
        >
          Add Repository
        </Button>

        <Button
          buttonType="secondary"
          buttonSize="normal"
          onClick={handleSyncAll}
          loading={isSyncAllPending}
          disabled={repositoriesQuery.isError}
        >
          Sync All
        </Button>
      </div>

      {(repositoriesQuery.isError || repositoriesQuery.data?.length === 0) && (
        <div className="flex flex-col gap-y-2 rounded-lg border border-panel-border bg-panel-input p-6">
          <div className="text-lg font-semibold">Repositories unavailable</div>
          <div className="opacity-65">
            {repositoriesQuery.isError ? 'Repository data could not be loaded.' : 'No repositories are configured'}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-y-3">
        {repositories.map(repository => (
          <RepositoryCard
            key={repository.ID}
            repository={repository}
          />
        ))}
      </div>

      <RepositoryModal
        show={showRepositoryModal}
        onClose={toggleRepositoryModal}
      />
    </div>
  );
};

export default RepositoriesSection;
