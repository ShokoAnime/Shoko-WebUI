import React, { useMemo, useState } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';
import Button from '@/components/Input/Button';
import RepositoryForm from '@/components/Settings/PluginManagement/RepositoryForm';
import toast from '@/components/Toast';
import {
  useDeletePluginPackageRepositoryMutation,
  useSyncAllPluginPackageRepositoriesMutation,
  useSyncPluginPackageRepositoryMutation,
} from '@/core/react-query/plugin-package/mutations';
import { usePluginPackageRepositoriesQuery } from '@/core/react-query/plugin-package/queries';
import { dayjs } from '@/core/util';

import type { PackageRepositoryInfoType } from '@/core/types/api/plugin-package';

type RepositoryDeleteStateType = {
  ID: string;
  Name: string;
};

type RepositoryCardProps = {
  isDeleting: boolean;
  repository: PackageRepositoryInfoType;
  onDelete: (repository: RepositoryDeleteStateType) => void;
};

const RepositoryCard = ({ isDeleting, onDelete, repository }: RepositoryCardProps) => {
  const { isPending: isSyncing, mutate: syncRepository } = useSyncPluginPackageRepositoryMutation();

  const handleSync = () => {
    syncRepository(repository.ID, {
      onSuccess: () => toast.success('Repository synchronized', repository.Name),
      onError: () => toast.error('Failed to synchronize repository', repository.Name),
    });
  };

  return (
    <div className="rounded-lg border border-panel-border bg-panel-background-alt p-4">
      <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-x-3">
        <div>
          <div className="font-semibold">{repository.Name}</div>
          <div className="text-sm opacity-65">{repository.Url}</div>
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-x-1 text-sm opacity-65">
        <span>Last sync:</span>
        <span>
          {repository.LastFetchedAt ? dayjs(repository.LastFetchedAt).format('MMMM Do, YYYY HH:mm') : 'Never'}
        </span>
      </div>
      <div className="flex flex-wrap justify-start gap-3 sm:justify-end">
        <Button buttonType="secondary" buttonSize="small" onClick={handleSync} loading={isSyncing}>
          Sync
        </Button>
        <Button
          buttonType="danger"
          buttonSize="small"
          onClick={() => onDelete({ ID: repository.ID, Name: repository.Name })}
          loading={isDeleting}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

type Props = {
  query: string;
};

const RepositoryPanel = ({ query }: Props) => {
  const repositoriesQuery = usePluginPackageRepositoriesQuery();
  const { isPending: isDeletePending, mutate: deleteRepository, variables: deletingRepositoryId } =
    useDeletePluginPackageRepositoryMutation();
  const { isPending: isSyncAllPending, mutate: syncAll } = useSyncAllPluginPackageRepositoriesMutation();
  const [isAddRepositoryOpen, setIsAddRepositoryOpen] = useState(false);
  const [repositoryToDelete, setRepositoryToDelete] = useState<RepositoryDeleteStateType | undefined>();

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

  if (repositoriesQuery.isError) {
    return (
      <div className="rounded-lg border border-panel-border bg-panel-input p-6">
        <div className="text-lg font-semibold">Repositories unavailable</div>
        <div className="mt-2 opacity-65">
          Repository data could not be loaded. Retry to continue managing plugin repositories.
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            buttonType="secondary"
            buttonSize="normal"
            onClick={() => {
              repositoriesQuery.refetch().catch(console.error);
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-wrap justify-start gap-3 sm:justify-end">
        {!query && (
          <Button
            buttonType="secondary"
            buttonSize="normal"
            onClick={() => setIsAddRepositoryOpen(true)}
          >
            Add Repository
          </Button>
        )}
        <Button buttonType="secondary" buttonSize="normal" onClick={handleSyncAll} loading={isSyncAllPending}>
          Sync All
        </Button>
      </div>

      <div className="rounded-lg border border-panel-border bg-panel-input p-4">
        <div className="mb-4 text-lg font-semibold">Configured Repositories</div>
        {repositories.length === 0 && (
          <div className="rounded-lg border border-panel-border bg-panel-background-alt p-4">
            {query ? 'No repositories match the current search.' : 'No plugin repositories are configured.'}
          </div>
        )}
        <div className="flex flex-col gap-y-3">
          {repositories.map(repository => (
            <RepositoryCard
              key={repository.ID}
              isDeleting={isDeletePending && deletingRepositoryId === repository.ID}
              repository={repository}
              onDelete={setRepositoryToDelete}
            />
          ))}
        </div>
      </div>

      <RepositoryForm
        show={isAddRepositoryOpen}
        onClose={() => setIsAddRepositoryOpen(false)}
      />

      <ConfirmationPromptModal
        show={!!repositoryToDelete}
        title="Remove Plugin Repository"
        confirmButtonType="danger"
        confirmText="Remove"
        onClose={() => setRepositoryToDelete(undefined)}
        onConfirm={() => {
          if (!repositoryToDelete) return;

          deleteRepository(repositoryToDelete.ID, {
            onSuccess: () => toast.success('Repository removed', repositoryToDelete.Name),
            onError: () => toast.error('Failed to remove repository', repositoryToDelete.Name),
          });
        }}
      >
        <div className="flex flex-wrap gap-x-1">
          <span>Remove repository</span>
          <span className="font-semibold">{repositoryToDelete?.Name}</span>
          <span>?</span>
        </div>
      </ConfirmationPromptModal>
    </div>
  );
};

export default RepositoryPanel;
