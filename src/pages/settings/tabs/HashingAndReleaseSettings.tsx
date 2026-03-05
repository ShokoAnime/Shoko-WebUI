import React, { useEffect, useMemo, useState } from 'react';
import { mdiCog, mdiInformationVariantCircle, mdiLoading } from '@mdi/js';
import Icon from '@mdi/react';
import { cloneDeep } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

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
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';

import type { HashProviderInfoType } from '@/core/types/api/hashing';
import type { ReleaseProviderInfoType } from '@/core/types/api/release-info';
import type { DropResult } from '@hello-pangea/dnd';

const HashingAndReleaseSettings = () => {
  const [infoShow, setInfoShow] = useState(false);
  const [infoProvider, setInfoProvider] = useState<HashProviderInfoType | ReleaseProviderInfoType | undefined>();
  const hashingProviderSummaryQuery = useHashingSummaryQuery();
  const releaseProviderSummaryQuery = useReleaseInfoSummaryQuery();
  const settingsQuery = useSettingsQuery();
  const hashingProvidersQuery = useHashingProvidersQuery();
  const releaseProvidersQuery = useReleaseInfoProvidersQuery();
  const { mutate: patchSettings } = usePatchSettingsMutation();
  const { mutate: updateHashingSettings } = useUpdateHashingSettingsMutation();
  const { mutate: updateHashingProviders } = useUpdateManyHashingProvidersMutation();
  const { mutate: updateReleaseInfoSettings } = useUpdateReleaseInfoSettingsMutation();
  const { mutate: updateReleaseInfoProviders } = useUpdateManyReleaseInfoProvidersMutation();
  const initialState = useMemo(() => {
    const releaseProviders = releaseProvidersQuery.data?.slice() ?? [];
    const webuiProviders = settingsQuery.data?.WebUI_Settings.linking.enabledReleaseProviders ?? [];
    const webuiProviderOrder = settingsQuery.data?.WebUI_Settings.linking.releaseProviderOrder ?? [];
    return {
      noEd2k: hashingProvidersQuery.data != null && hashingProvidersQuery.data.length > 0
        && !hashingProvidersQuery.data.some(provider => provider.EnabledHashTypes.includes('ED2K')),
      hashSummary: hashingProviderSummaryQuery.data ?? { ParallelMode: false },
      hashProviders: hashingProvidersQuery.data ?? [],
      releaseSummary: releaseProviderSummaryQuery.data ?? { ParallelMode: false },
      releaseProviders: releaseProvidersQuery.data ?? [],
      webuiReleaseProviders: releaseProviders
        .sort((providerA, providerB) => {
          const idA = providerA.ID;
          const idB = providerB.ID;
          const indexA = webuiProviderOrder.indexOf(idA);
          const indexB = webuiProviderOrder.indexOf(idB);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        })
        .map((provider, index) => ({
          ...provider,
          IsEnabled: webuiProviders.includes(provider.ID),
          Priority: index,
        })),
    };
  }, [
    settingsQuery.data,
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
  const [debouncedUnsavedChanges] = useDebounceValue(unsavedChanges, 100);

  const handleToggleHashingProviderHash = (event: React.ChangeEvent<HTMLInputElement>) => {
    const id = event.currentTarget.id.slice(0, 36);
    const clonedState = cloneDeep(state);
    const provider = clonedState.hashProviders.find(pro => pro.ID === id);
    if (!provider) return;
    const hash = event.currentTarget.id.slice(37);
    if (provider.EnabledHashTypes.includes(hash)) {
      provider.EnabledHashTypes.splice(provider.EnabledHashTypes.indexOf(hash), 1);
    } else provider.EnabledHashTypes.push(hash);

    const otherProviders = clonedState.hashProviders
      .filter(otherProvider => otherProvider.EnabledHashTypes.includes(hash) && otherProvider.ID !== id);
    if (otherProviders.length > 0) {
      for (const pro of otherProviders) {
        pro.EnabledHashTypes.splice(pro.EnabledHashTypes.indexOf(hash), 1);
      }
    }

    clonedState.noEd2k = clonedState.hashProviders.length > 0
      && !clonedState.hashProviders.some(pro => pro.EnabledHashTypes.includes('ED2K'));
    setState(clonedState);
  };

  const handleToggleParallelHashing = () => {
    const clonedState = cloneDeep(state);
    clonedState.hashSummary.ParallelMode = !clonedState.hashSummary.ParallelMode;
    setState(clonedState);
  };

  const handleToggleReleaseInfoProvider = (event: React.ChangeEvent<HTMLInputElement>) => {
    const id = event.target.id.slice(0, 36);
    const { checked } = event.target;
    const clonedState = cloneDeep(state);
    clonedState.releaseProviders.find(pro => pro.ID === id)!.IsEnabled = checked;
    setState(clonedState);
  };

  const handleToggleWebuiReleaseInfoProvider = (event: React.ChangeEvent<HTMLInputElement>) => {
    const id = event.target.id.slice(0, 36);
    const { checked } = event.target;
    const clonedState = cloneDeep(state);
    clonedState.webuiReleaseProviders.find(pro => pro.ID === id)!.IsEnabled = checked;
    setState(clonedState);
  };

  const handleToggleParallelRelease = () => {
    const clonedState = cloneDeep(state);
    clonedState.releaseSummary.ParallelMode = !clonedState.releaseSummary.ParallelMode;
    setState(clonedState);
  };

  const handleDragRelease = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index || !releaseProvidersQuery.isSuccess) {
      return;
    }

    const clonedState = cloneDeep(state);
    const [removed] = clonedState.releaseProviders.splice(result.source.index, 1);
    clonedState.releaseProviders.splice(result.destination.index, 0, removed);
    for (let priority = 0; priority < clonedState.releaseProviders.length; priority += 1) {
      clonedState.releaseProviders[priority].Priority = priority;
    }
    setState(clonedState);
  };

  const handleDragReleaseWebui = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index || !releaseProvidersQuery.isSuccess) {
      return;
    }

    const clonedState = cloneDeep(state);
    const [removed] = clonedState.webuiReleaseProviders.splice(result.source.index, 1);
    clonedState.webuiReleaseProviders.splice(result.destination.index, 0, removed);
    for (let priority = 0; priority < clonedState.webuiReleaseProviders.length; priority += 1) {
      clonedState.webuiReleaseProviders[priority].Priority = priority;
    }
    setState(clonedState);
  };

  const handleOpenInfo = (event: React.MouseEvent<HTMLButtonElement>) => {
    const id = event.currentTarget.id.slice(0, -'-info'.length);
    const provider = state.releaseProviders.find(item => item.ID === id)
      ?? state.hashProviders.find(item => item.ID === id)!;
    setInfoShow(true);
    setInfoProvider(provider);
  };

  const handleCloseInfo = () => {
    setInfoShow(false);
  };

  const handleCancel = () => {
    setState(cloneDeep(initialState));
  };

  const updateWebuiReleaseInfoProviders = async (providers: ReleaseProviderInfoType[]): Promise<void> => {
    const settings = cloneDeep(settingsQuery.data);
    const { enabledReleaseProviders, releaseProviderOrder } = settings.WebUI_Settings.linking;
    enabledReleaseProviders.length = 0;
    releaseProviderOrder.length = 0;

    for (const provider of providers) {
      releaseProviderOrder.push(provider.ID);
      if (provider.IsEnabled) {
        enabledReleaseProviders.push(provider.ID);
      }
    }

    await (patchSettings(settings) as unknown as Promise<unknown>);
  };

  const handleSave = () => {
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
    if (JSON.stringify(initialState.webuiReleaseProviders) !== JSON.stringify(state.webuiReleaseProviders)) {
      promises.push(updateWebuiReleaseInfoProviders(state.webuiReleaseProviders));
    }
    Promise.all(promises)
      .then(() => {
        toast.success('Settings saved successfully.');
      })
      .catch((error) => {
        console.error(error);
        toast.error(`Failed to save settings: ${error}`);
      });
  };

  useEffect(() => {
    if (!debouncedUnsavedChanges) {
      toast.dismiss('hashing-release-unsaved');
    } else {
      toast.info(
        'Unsaved Changes',
        'Please save before leaving this page.',
        { autoClose: false, position: 'top-right', toastId: 'hashing-release-unsaved' },
      );
    }
  }, [debouncedUnsavedChanges]);

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

  useEffect(() => () => {
    toast.dismiss('hashing-release-unsaved');
    toast.dismiss('no-ed2k');
  }, []);

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
            id: 'sequential',
            name: 'Sequential Mode',
            current: !state.hashSummary.ParallelMode,
            onClick: handleToggleParallelHashing,
          }, {
            id: 'parallel',
            name: 'Parallel Mode',
            current: state.hashSummary.ParallelMode,
            onClick: handleToggleParallelHashing,
          }]}
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
                              disabled
                              className="text-button-primary opacity-65 cursor-default"
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
            id: 'sequential',
            name: 'Sequential Mode',
            current: !state.releaseSummary.ParallelMode,
            onClick: handleToggleParallelRelease,
          }, {
            id: 'parallel',
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
              Auto-Linking Release Providers
              <span className="self-center text-xs opacity-65">(Drag to Reorder)</span>
            </span>
          </div>
          <div className="mt-2 flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
            <DnDList onDragEnd={handleDragRelease}>
              {state.releaseProviders.map(definition => ({
                key: definition.ID,
                item: (
                  <Checkbox
                    id={`${definition.ID}-server`}
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
                              disabled
                              className="text-button-primary opacity-65 cursor-default"
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
            Enabled auto-search release providers in the automated linking process, in priority order.
          </div>
        </div>

        <div className="border-b border-panel-border" />

        <div>
          <div className="mt-2 flex justify-between">
            <span className="flex gap-x-1.5">
              Manual Linking Release Providers
              <span className="self-center text-xs opacity-65">(Drag to Reorder)</span>
            </span>
          </div>
          <div className="mt-2 flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
            <DnDList onDragEnd={handleDragReleaseWebui}>
              {state.webuiReleaseProviders.map(definition => ({
                key: definition.ID,
                item: (
                  <Checkbox
                    id={`${definition.ID}-webui`}
                    isChecked={definition.IsEnabled}
                    onChange={handleToggleWebuiReleaseInfoProvider}
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
                              disabled
                              className="text-button-primary opacity-65 cursor-default"
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
            Enabled auto-search release providers in the manual linking process, in priority order.
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
      <ProviderInfoModal show={infoShow} provider={infoProvider} onClose={handleCloseInfo} />
    </>
  );
};

export default HashingAndReleaseSettings;
