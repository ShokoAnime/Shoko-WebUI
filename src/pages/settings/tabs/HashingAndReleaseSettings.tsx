import React, { useEffect, useMemo, useState } from 'react';
import { mdiCog, mdiInformationVariantCircle, mdiLoading } from '@mdi/js';
import Icon from '@mdi/react';
import { cloneDeep } from 'lodash';

import ConfigurationModal from '@/components/Dialogs/ConfigurationModal';
import ProviderInfoModal from '@/components/Dialogs/ProviderInfoModal';
import DnDList from '@/components/DnDList/DnDList';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import TabPills from '@/components/TabPills';
import toast from '@/components/Toast';
import {
  useUpdateHashingSettingsMutation,
  useUpdateManyHashingProvidersMutation,
} from '@/core/react-query/hashing/mutations';
import { useHashingProvidersQuery, useHashingSummaryQuery } from '@/core/react-query/hashing/queries';
import {
  useUpdateManyReleaseInfoProvidersMutation,
  useUpdateReleaseInfoSettingsMutation,
} from '@/core/react-query/release-info/mutations';
import { useReleaseInfoProvidersQuery, useReleaseInfoSummaryQuery } from '@/core/react-query/release-info/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { HashProviderInfoType } from '@/core/types/api/hashing';
import type { ReleaseProviderInfoType } from '@/core/types/api/release-info';
import type { DropResult } from '@hello-pangea/dnd';

function HashingAndReleaseSettings() {
  const [info, setInfo] = useState<{ show: boolean, provider: HashProviderInfoType | ReleaseProviderInfoType | null }>(
    () => ({ show: false, provider: null }),
  );
  const [config, setConfig] = useState<
    { show: boolean, configGuid: string | null, title: string, description: string }
  >(() => ({ show: false, configGuid: null, title: '', description: '' }));
  const hashingProviderSummaryQuery = useHashingSummaryQuery();
  const hashingProvidersQuery = useHashingProvidersQuery();
  const { mutate: updateHashingSettings } = useUpdateHashingSettingsMutation();
  const { mutate: updateHashingProviders } = useUpdateManyHashingProvidersMutation();
  const releaseProviderSummaryQuery = useReleaseInfoSummaryQuery();
  const releaseProvidersQuery = useReleaseInfoProvidersQuery();
  const { mutate: updateReleaseInfoSettings } = useUpdateReleaseInfoSettingsMutation();
  const { mutate: updateReleaseInfoProviders } = useUpdateManyReleaseInfoProvidersMutation();
  const initialState = useMemo(() => ({
    noEd2k: hashingProvidersQuery.data != null && hashingProvidersQuery.data.length > 0
      && !hashingProvidersQuery.data.some(provider => provider.EnabledHashTypes.includes('ED2K')),
    hashSummary: hashingProviderSummaryQuery.data ?? { ParallelMode: false },
    hashProviders: hashingProvidersQuery.data ?? [],
    releaseSummary: releaseProviderSummaryQuery.data ?? { ParallelMode: false },
    releaseProviders: releaseProvidersQuery.data ?? [],
  }), [
    hashingProviderSummaryQuery.data,
    releaseProviderSummaryQuery.data,
    hashingProvidersQuery.data,
    releaseProvidersQuery.data,
  ]);
  const hashOrder = useMemo(() => {
    const hashes = Array.from(new Set(initialState.hashProviders.flatMap(pro => pro.AvailableHashTypes)));
    hashes.splice(hashes.indexOf('ED2K'), 1);
    hashes.unshift('ED2K');
    return hashes
      .map(hash => ({
        hash,
        providerIDs: initialState.hashProviders.filter(pro => pro.AvailableHashTypes.includes(hash)).map(pro => pro.ID),
      }));
  }, [initialState]);
  const [state, setState] = useState(initialState);
  const isReady = hashingProviderSummaryQuery.isSuccess
    && hashingProvidersQuery.isSuccess
    && releaseProviderSummaryQuery.isSuccess
    && releaseProvidersQuery.isSuccess;

  const unsavedChanges = useMemo(() => JSON.stringify(state) !== JSON.stringify(initialState), [state, initialState]);

  const handleToggleHashingProviderHash = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const id = event.currentTarget.id.slice(0, 36);
    const sta = cloneDeep(state);
    const provider = sta.hashProviders.find(pro => pro.ID === id);
    if (!provider) return;
    const hash = event.currentTarget.id.slice(37);
    if (provider.EnabledHashTypes.includes(hash)) {
      provider.EnabledHashTypes.splice(provider.EnabledHashTypes.indexOf(hash), 1);
    } else provider.EnabledHashTypes.push(hash);

    const otherProviders = sta.hashProviders.filter(pro => pro.EnabledHashTypes.includes(hash) && pro.ID !== id);
    if (otherProviders.length > 0) {
      for (const pro of otherProviders) {
        pro.EnabledHashTypes.splice(pro.EnabledHashTypes.indexOf(hash), 1);
      }
    }

    sta.noEd2k = sta.hashProviders.length > 0 && !sta.hashProviders.some(pro => pro.EnabledHashTypes.includes('ED2K'));
    setState(sta);
  });

  const handleToggleParallelHashing = useEventCallback(() => {
    const sta = cloneDeep(state);
    sta.hashSummary.ParallelMode = !sta.hashSummary.ParallelMode;
    setState(sta);
  });

  const handleToggleReleaseInfoProvider = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { id } = event.target;
    const { checked } = event.target;
    const sta = cloneDeep(state);
    sta.releaseProviders.find(pro => pro.ID === id)!.IsEnabled = checked;
    setState(sta);
  });

  const handleToggleParallelRelease = useEventCallback(() => {
    const sta = cloneDeep(state);
    sta.releaseSummary.ParallelMode = !sta.releaseSummary.ParallelMode;
    setState(sta);
  });

  const handleDragRelease = useEventCallback((result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index || !releaseProvidersQuery.isSuccess) {
      return;
    }

    const sta = cloneDeep(state);
    const [removed] = sta.releaseProviders.splice(result.source.index, 1);
    sta.releaseProviders.splice(result.destination.index, 0, removed);
    setState(sta);
  });

  const handleOpenInfo = useEventCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const id = event.currentTarget.id.slice(0, -'-info'.length);
    const provider = state.releaseProviders.find(item => item.ID === id)
      ?? state.hashProviders.find(item => item.ID === id)!;
    setInfo({ show: true, provider });
  });

  const handleCloseInfo = useEventCallback(() => {
    setInfo(prev => ({ ...prev, show: false }));
  });

  const handleOpenConfig = useEventCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const id = event.currentTarget.id.slice(0, -'-config'.length);

    const { Description: description, ID: configGuid, Name: title } = (state.releaseProviders.find(item =>
      item.ID === id
    ) ?? state.hashProviders.find(item => item.ID === id)!).Configuration!;
    setConfig({ show: true, configGuid, title, description: description ?? '' });
  });

  const handleCloseConfig = useEventCallback(() => {
    setConfig(prev => ({ ...prev, show: false }));
  });

  const handleCancel = useEventCallback(() => {
    setState(cloneDeep(initialState));
  });

  const handleSave = useEventCallback(() => {
    const promises: Promise<unknown>[] = [];
    if (JSON.stringify(initialState.hashSummary) !== JSON.stringify(state.hashSummary)) {
      promises.push(updateHashingSettings(state.hashSummary) as unknown as Promise<unknown>);
    }
    if (JSON.stringify(initialState.hashProviders) !== JSON.stringify(state.hashProviders)) {
      promises.push(updateHashingProviders(state.hashProviders) as unknown as Promise<unknown>);
    }
    if (JSON.stringify(initialState.releaseSummary) !== JSON.stringify(state.releaseSummary)) {
      promises.push(updateReleaseInfoSettings(state.releaseSummary) as unknown as Promise<unknown>);
    }
    if (JSON.stringify(initialState.releaseProviders) !== JSON.stringify(state.releaseProviders)) {
      promises.push(updateReleaseInfoProviders(state.releaseProviders) as unknown as Promise<unknown>);
    }
    Promise.all(promises)
      .then(() => {
        toast.success('Settings saved successfully.');
      })
      .catch((error) => {
        console.error(error);
        toast.error(`Failed to save settings: ${error}`);
      });
  });

  useEffect(() => {
    if (!unsavedChanges) {
      toast.dismiss('unsaved');
    } else {
      toast.info(
        'Unsaved Changes',
        'Please save before leaving this page.',
        { autoClose: false, position: 'top-right', toastId: 'unsaved' },
      );
    }
  }, [unsavedChanges]);

  useEffect(() => {
    if (!state.noEd2k) {
      toast.dismiss('no-ed2k');
    } else {
      toast.warning(
        'No ED2K Provider',
        'Please select an ED2K provider to use.',
        { autoClose: false, position: 'top-right', toastId: 'no-ed2k' },
      );
    }
  }, [state.noEd2k]);

  useEffect(() => {
    setState(cloneDeep(initialState));
  }, [initialState]);

  if (!isReady) {
    return <Icon path={mdiLoading} size={4} spin className="m-auto text-panel-text-primary" />;
  }

  return (
    <>
      <title>Settings &gt; Hashing & Release | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">Hashing & Release</div>
        <div>
          Configure how Shoko hashes files and handles releases.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">Hashing Options</div>

        <TabPills
          tabs={[{
            name: 'Sequential Mode',
            current: !state.hashSummary.ParallelMode,
            onClick: handleToggleParallelHashing,
          }, { name: 'Parallel Mode', current: state.hashSummary.ParallelMode, onClick: handleToggleParallelHashing }]}
        />

        <div className="flex flex-row gap-x-1">
          {state.hashSummary.ParallelMode
            ? (
              <>
                Run all enabled providers in parallel, and wait until all providers have computed their hashes, then
                merge their lists.
              </>
            )
            : (
              <>
                Run each enabled provider in sequential order, until all providers have computed their hashes.
              </>
            )}
        </div>

        {hashOrder.map(({ hash, providerIDs }) => (
          <div key={hash}>
            <div className="mt-2 flex justify-between">
              <span className="flex gap-x-1">
                <span className="">
                  {hash}
                </span>
                Providers
              </span>
            </div>
            <div className="mt-2 flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
              <div className="flex grow flex-col gap-y-2">
                {state.hashProviders.filter(provider => providerIDs.includes(provider.ID)).map(definition => (
                  <Checkbox
                    key={definition.ID}
                    id={`${definition.ID}-${hash}`}
                    isChecked={definition.EnabledHashTypes.includes(hash)}
                    onChange={handleToggleHashingProviderHash}
                    labelRight
                    justify
                    className="grow"
                    labelClassName="grow"
                    label={
                      <>
                        <span className="flex grow gap-x-1.5">
                          {definition.Name}
                          <span className="self-center text-xs opacity-65">
                            (
                            {definition.Plugin.Name}
                            )
                          </span>
                        </span>
                        <span className="flex gap-x-1">
                          {definition.Configuration && (
                            <button
                              id={`${definition.ID}-config`}
                              type="button"
                              onClick={handleOpenConfig}
                              className="text-button-primary"
                            >
                              <Icon path={mdiCog} size={1} />
                            </button>
                          )}
                          <button
                            id={`${definition.ID}-info`}
                            type="button"
                            onClick={handleOpenInfo}
                            className="text-button-primary"
                          >
                            <Icon path={mdiInformationVariantCircle} size={1} />
                          </button>
                        </span>
                      </>
                    }
                  />
                ))}
              </div>
            </div>
            <div className="mt-1 text-sm text-panel-text opacity-65">
              {`Enabled provider for the ${hash} algorithm. Unselect all to disable the algorithm.`}
            </div>
          </div>
        ))}
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">Releases Options</div>

        <TabPills
          tabs={[{
            name: 'Sequential Mode',
            current: !state.releaseSummary.ParallelMode,
            onClick: handleToggleParallelRelease,
          }, {
            name: 'Parallel Mode',
            current: state.releaseSummary.ParallelMode,
            onClick: handleToggleParallelRelease,
          }]}
        />

        <div className="border-b border-panel-border" />

        <div className="flex flex-row gap-x-1">
          {state.releaseSummary.ParallelMode
            ? (
              <>
                Run all enabled providers in parallel, and wait for the highest priority valid result.
              </>
            )
            : (
              <>
                Run each provider in sequential order defined by the priority below until a valid result is found.
              </>
            )}
        </div>

        <div className="border-b border-panel-border" />

        <div>
          <div className="mt-2 flex justify-between">
            <span className="flex gap-x-1.5">
              Release Providers
              <span className="self-center text-xs opacity-65">(Drag to Reorder)</span>
            </span>
          </div>
          <div className="mt-2 flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
            <DnDList onDragEnd={handleDragRelease}>
              {state.releaseProviders.map(definition => ({
                key: definition.ID,
                item: (
                  <Checkbox
                    id={definition.ID}
                    isChecked={definition.IsEnabled}
                    onChange={handleToggleReleaseInfoProvider}
                    labelRight
                    justify
                    className="grow"
                    labelClassName="grow"
                    label={
                      <>
                        <span className="flex grow gap-x-1.5">
                          {definition.Name}
                          <span className="self-center text-xs opacity-65">
                            (
                            {definition.Plugin.Name}
                            )
                          </span>
                        </span>
                        <span className="flex gap-x-1">
                          {definition.Configuration && (
                            <button
                              id={`${definition.ID}-config`}
                              type="button"
                              onClick={handleOpenConfig}
                              className="text-button-primary"
                            >
                              <Icon path={mdiCog} size={1} />
                            </button>
                          )}
                          <button
                            id={`${definition.ID}-info`}
                            type="button"
                            onClick={handleOpenInfo}
                            className="text-button-primary"
                          >
                            <Icon path={mdiInformationVariantCircle} size={1} />
                          </button>
                        </span>
                      </>
                    }
                  />
                ),
              }))}
            </DnDList>
          </div>
          <div className="mt-1 text-sm text-panel-text opacity-65">
            Enabled release providers, in priority order.
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex justify-end gap-x-3 font-semibold">
        <Button
          onClick={handleCancel}
          buttonType="secondary"
          buttonSize="normal"
          disabled={!unsavedChanges}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          buttonType="primary"
          buttonSize="normal"
          disabled={!unsavedChanges || state.noEd2k}
        >
          Save
        </Button>
      </div>
      <ConfigurationModal
        show={config.show}
        configGuid={config.configGuid}
        title={config.title}
        description={config.description}
        onClose={handleCloseConfig}
      />
      <ProviderInfoModal show={info.show} provider={info.provider} onClose={handleCloseInfo} />
    </>
  );
}

export default HashingAndReleaseSettings;
