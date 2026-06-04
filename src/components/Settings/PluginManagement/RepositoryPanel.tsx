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

type RepositoryDeleteStateType = {
  ID: string;
  Name: string;
};

type Props = {
  query: string;
};

const RepositoryPanel = ({ query }: Props) => {
  const repositoriesQuery = usePluginPackageRepositoriesQuery();
  const { isPending: isDeletePending, mutate: deleteRepository, variables: deletingId } =
    useDeletePluginPackageRepositoryMutation();
  const { isPending: isSyncPending, mutate: syncRepository, variables: syncingRepositoryId } =
    useSyncPluginPackageRepositoryMutation();
  const { isPending: isSyncAllPending, mutate: syncAll } = useSyncAllPluginPackageRepositoriesMutation();
  const [isAddRepositoryOpen, setIsAddRepositoryOpen] = useState(false);
  const [repositoryToDelete, setRepositoryToDelete] = useState<RepositoryDeleteStateType | null>(null);

  const repositories = useMemo(() => {
    if (!repositoriesQuery.data) return [];
    if (!query) return repositoriesQuery.data;

    const matchesQuery = (value: string) => value.toLowerCase().includes(query.toLowerCase());

    return repositoriesQuery.data.filter(repository => [repository.Name, repository.Url].some(matchesQuery));
  }, [query, repositoriesQuery.data]);
  const retryRepositories = () => {
    repositoriesQuery.refetch().catch(console.error);
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
        <div className="mt-2 opacity-80">
          Repository data could not be loaded. Retry to continue managing plugin repositories.
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            buttonType="secondary"
            buttonSize="normal"
            onClick={retryRepositories}
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
        <Button
          buttonType="secondary"
          buttonSize="normal"
          onClick={() =>
            syncAll(true, {
              onSuccess: () => toast.success('Repositories synchronized'),
              onError: () => toast.error('Failed to synchronize repositories'),
            })}
          loading={isSyncAllPending}
        >
          Sync All
        </Button>
      </div>

      <div className="rounded-lg border border-panel-border bg-panel-input p-4">
        <div className="mb-4 text-lg font-semibold">Configured Repositories</div>
        {repositoriesQuery.data && repositories.length === 0 && !query && (
          <div className="rounded-lg border border-panel-border bg-panel-background-alt p-4">
            No plugin repositories are configured.
          </div>
        )}
        {repositoriesQuery.data && repositories.length === 0 && query && (
          <div className="rounded-lg border border-panel-border bg-panel-background-alt p-4">
            No repositories match the current search.
          </div>
        )}
        <div className="flex flex-col gap-y-3">
          {repositories.map((repository) => {
            const isSyncing = isSyncPending && syncingRepositoryId === repository.ID;
            const isDeleting = isDeletePending && deletingId === repository.ID;

            return (
              <div key={repository.ID} className="rounded-lg border border-panel-border bg-panel-background-alt p-4">
                <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-x-3">
                  <div>
                    <div className="font-semibold">{repository.Name}</div>
                    <div className="text-sm opacity-80">{repository.Url}</div>
                  </div>
                </div>
                <div className="mb-3 flex flex-wrap gap-x-1 text-sm opacity-65">
                  <span>Last sync:</span>
                  <span>
                    {repository.LastFetchedAt ? dayjs(repository.LastFetchedAt).format('D MMMM YYYY, HH:mm') : 'Never'}
                  </span>
                </div>
                <div className="flex flex-wrap justify-start gap-3 sm:justify-end">
                  <Button
                    buttonType="secondary"
                    buttonSize="small"
                    onClick={() =>
                      syncRepository(repository.ID, {
                        onSuccess: () =>
                          toast.success('Repository synchronized', repository.Name),
                        onError: () =>
                          toast.error('Failed to synchronize repository', repository.Name),
                      })}
                    loading={isSyncing}
                  >
                    Sync
                  </Button>
                  <Button
                    buttonType="danger"
                    buttonSize="small"
                    onClick={() => setRepositoryToDelete({ ID: repository.ID, Name: repository.Name })}
                    loading={isDeleting}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
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
        onClose={() => setRepositoryToDelete(null)}
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
