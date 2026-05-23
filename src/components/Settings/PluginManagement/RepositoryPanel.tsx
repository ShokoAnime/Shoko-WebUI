import React, { useState } from 'react';

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

type RepositoryDeleteStateType = {
  ID: string;
  Name: string;
};

type Props = {
  query: string;
};

const RepositoryPanel = ({ query }: Props) => {
  const repositoriesQuery = usePluginPackageRepositoriesQuery();
  const { mutate: deleteRepository, variables: deletingId } = useDeletePluginPackageRepositoryMutation();
  const { mutate: syncRepository, variables: syncingArgs } = useSyncPluginPackageRepositoryMutation();
  const { mutate: syncAll, status: syncAllStatus } = useSyncAllPluginPackageRepositoriesMutation();
  const [repositoryToDelete, setRepositoryToDelete] = React.useState<RepositoryDeleteStateType | null>(null);
  const [isFormCollapsed, setIsFormCollapsed] = useState(true); // Start collapsed by default
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const isSearching = normalizedQuery.length > 0;
  const repositories = React.useMemo(() => {
    if (!normalizedQuery) {
      return repositoriesQuery.data?.filter(repo => repo.ID !== '00000000-0000-0000-0000-000000000000') ?? [];
    }

    const matchesQuery = (value: string) => value.toLocaleLowerCase().includes(normalizedQuery);

    return (repositoriesQuery.data ?? []).filter((repository) => {
      const isValidRepository = repository.ID !== '00000000-0000-0000-0000-000000000000';

      return (
        isValidRepository
        && [repository.Name, repository.Url].some(matchesQuery)
      );
    });
  }, [normalizedQuery, repositoriesQuery.data]);
  const shouldShowForm = !isSearching && !isFormCollapsed; // Only show form when not searching and not collapsed

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex justify-start sm:justify-end">
        <Button
          buttonType="secondary"
          buttonSize="normal"
          onClick={() =>
            syncAll({ forceSync: true }, {
              onSuccess: () => toast.success('Repositories synchronized'),
            })}
          loading={syncAllStatus === 'pending'}
        >
          Sync All
        </Button>
      </div>

      {/* Add button to toggle form visibility */}
      {!isSearching && (
        <div className="flex justify-start">
          <Button
            buttonType="secondary"
            buttonSize="small"
            onClick={() => setIsFormCollapsed(!isFormCollapsed)}
          >
            Add Repository
          </Button>
        </div>
      )}

      {/* Show form only when appropriate */}
      {shouldShowForm && <RepositoryForm />}

      <div className="rounded-lg border border-panel-border bg-panel-input p-4">
        <div className="mb-4 flex flex-col gap-y-1">
          <div className="text-lg font-semibold">Configured Repositories</div>
          {isSearching && <div className="text-sm opacity-70">Clear the search field to add a new repository.</div>}
        </div>
        {repositoriesQuery.data?.length === 0 && (
          <div className="rounded-lg border border-panel-border bg-panel-background-alt p-4">
            No plugin repositories are configured.
          </div>
        )}
        {repositoriesQuery.data && repositories.length === 0 && normalizedQuery && (
          <div className="rounded-lg border border-panel-border bg-panel-background-alt p-4">
            No repositories match the current search.
          </div>
        )}
        <div className="flex flex-col gap-y-3">
          {repositories.map((repository) => {
            const isLocalRepository = repository.ID === '00000000-0000-0000-0000-000000000000';
            const isSyncing = syncingArgs?.repositoryId === repository.ID;
            const isDeleting = deletingId === repository.ID;

            return (
              <div key={repository.ID} className="rounded-lg border border-panel-border bg-panel-background-alt p-4">
                <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-x-3">
                  <div>
                    <div className="font-semibold">{repository.Name}</div>
                    <div className="text-sm opacity-80">{repository.Url}</div>
                  </div>
                  {isLocalRepository && (
                    <span className="rounded-lg border border-panel-border px-2 py-1 text-xs">Local</span>
                  )}
                </div>
                <div className="mb-3 flex flex-wrap gap-x-1 text-sm opacity-65">
                  <span>Last sync:</span>
                  <span>
                    {repository.LastFetchedAt ? new Date(repository.LastFetchedAt).toLocaleString() : 'Never'}
                  </span>
                </div>
                {repository.StaleTime && (
                  <div className="mb-3 flex flex-wrap gap-x-1 text-sm opacity-65">
                    <span>Refresh interval:</span>
                    <span>{repository.StaleTime}</span>
                  </div>
                )}
                <div className="flex flex-wrap justify-start gap-3 sm:justify-end">
                  <Button
                    buttonType="secondary"
                    buttonSize="small"
                    onClick={() =>
                      syncRepository({ repositoryId: repository.ID }, {
                        onSuccess: () =>
                          toast.success('Repository synchronized', repository.Name),
                      })}
                    loading={isSyncing}
                  >
                    Sync
                  </Button>
                  <Button
                    buttonType="danger"
                    buttonSize="small"
                    disabled={isLocalRepository}
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
