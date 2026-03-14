import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiCog, mdiInformationVariantCircleOutline, mdiLoading } from '@mdi/js';
import Icon from '@mdi/react';
import { produce } from 'immer';
import { isEqual } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import HashTypesModal from '@/components/Dialogs/HashTypesModal';
import ProviderInfoModal from '@/components/Dialogs/ProviderInfoModal';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ReleaseSettings from '@/components/Settings/HashingAndReleaseSettings/ReleaseSettings';
import toast from '@/components/Toast';
import { useUpdateHashingSettingsQuery } from '@/core/react-query/hashing/mutations';
import { useHashingProvidersQuery, useHashingSummaryQuery } from '@/core/react-query/hashing/queries';
import {
  useUpdateReleaseInfoProvidersMutation,
  useUpdateReleaseInfoSettingsMutation,
} from '@/core/react-query/release-info/mutations';
import { useReleaseInfoProvidersQuery, useReleaseInfoSummaryQuery } from '@/core/react-query/release-info/queries';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { hideProviderInfo, showProviderInfo } from '@/core/slices/modals/providerInfo';
import { clearReleaseSettings, setProviders, setReleaseInfoSettings } from '@/core/slices/settings/release';

import type { HashProviderInfoType, HashingSummaryType } from '@/core/react-query/hashing/types';
import type { RootState } from '@/core/store';
import type { ManualLinkProviderType } from '@/core/types/utilities/unrecognized-utility';

const HashingAndReleaseSettings = () => {
  const dispatch = useDispatch();
  const {
    initialized,
    providers,
    releaseInfoSettings,
    webuiProviders,
  } = useSelector((state: RootState) => state.settings.release);

  const settings = useSettingsQuery().data;
  const releaseProvidersQuery = useReleaseInfoProvidersQuery();
  const releaseProviderSummaryQuery = useReleaseInfoSummaryQuery();
  const hashingProvidersQuery = useHashingProvidersQuery();
  const hashingSummaryQuery = useHashingSummaryQuery();

  const { mutate: patchSettings } = usePatchSettingsMutation();
  const { mutate: updateReleaseInfoSettings } = useUpdateReleaseInfoSettingsMutation();
  const { mutate: updateReleaseInfoProviders } = useUpdateReleaseInfoProvidersMutation();
  const { mutate: updateHashingSettings } = useUpdateHashingSettingsQuery();

  const [showHashTypesModal, setShowHashTypesModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<HashProviderInfoType | undefined>();
  const [hashingSettings, setHashingSettings] = useState<HashingSummaryType>({ ParallelMode: false });

  const newWebuiProviderOrder = webuiProviders
    .map(provider => ({ id: provider.ID, enabled: provider.IsEnabled } as ManualLinkProviderType));

  useEffect(() => {
    if (
      !releaseProvidersQuery.data || !releaseProviderSummaryQuery.data || !hashingProvidersQuery.data
      || !hashingSummaryQuery.data
    ) return;
    setHashingSettings(hashingSummaryQuery.data);

    dispatch(setReleaseInfoSettings({ ParallelMode: releaseProviderSummaryQuery.data.ParallelMode ?? false }));

    const cleanWebuiProviders = settings.WebUI_Settings.releaseInfoProviders
      .map((webuiProvider) => {
        const foundProvider = releaseProvidersQuery.data.find(provider => provider.ID === webuiProvider.id);
        if (!foundProvider) return undefined;
        return { ...foundProvider, IsEnabled: webuiProvider.enabled };
      })
      .filter(webuiProvider => !!webuiProvider);

    const existingIds = new Set(cleanWebuiProviders.map(provider => provider.ID));
    const newProviders = releaseProvidersQuery.data.filter(provider => !existingIds.has(provider.ID));

    dispatch(setProviders({
      providers: releaseProvidersQuery.data,
      webuiProviders: [...cleanWebuiProviders, ...newProviders],
    }));
  }, [
    hashingProvidersQuery.data,
    hashingSummaryQuery.data,
    releaseProviderSummaryQuery.data,
    releaseProvidersQuery.data,
    settings,
    dispatch,
  ]);

  useEffect(() => () => {
    dispatch(clearReleaseSettings());
    dispatch(hideProviderInfo());
  }, [dispatch]);

  const toastId = useRef<number | string>(undefined);

  const hashingSettingsChanged = hashingSummaryQuery.data?.ParallelMode !== hashingSettings.ParallelMode;
  const releaseProvidersChanged = !isEqual(releaseProvidersQuery.data, providers);
  const releaseInfoSettingsChanged =
    releaseProviderSummaryQuery.data?.ParallelMode !== releaseInfoSettings.ParallelMode;
  const webuiProvidersChanged = !isEqual(settings.WebUI_Settings.releaseInfoProviders, newWebuiProviderOrder);
  const unsavedChanges = initialized
    && (hashingSettingsChanged || releaseProvidersChanged || releaseInfoSettingsChanged || webuiProvidersChanged);
  const [debouncedUnsavedChanges] = useDebounceValue(unsavedChanges, 100);

  // Use debounced value for unsaved changes to avoid flashing the toast for certain changes
  useEffect(() => {
    if (!debouncedUnsavedChanges) {
      if (toastId.current) toast.dismiss(toastId.current);
      return;
    }

    toastId.current = toast.info(
      'Unsaved Changes',
      'Please save before leaving the settings.',
      { autoClose: false, position: 'top-right' },
      true,
    );
  }, [debouncedUnsavedChanges]);

  useEffect(() => () => {
    if (toastId.current) toast.dismiss(toastId.current);
  }, []);

  const handleCancel = () => {
    setShowHashTypesModal(false);
  };

  const handleSave = () => {
    if (hashingSettingsChanged) {
      updateHashingSettings({ ParallelMode: hashingSettings.ParallelMode });
    }

    if (releaseProvidersChanged) {
      updateReleaseInfoProviders(providers);
    }

    if (releaseInfoSettingsChanged) {
      updateReleaseInfoSettings({ ParallelMode: releaseInfoSettings.ParallelMode });
    }

    if (webuiProvidersChanged) {
      const newSettings = produce(settings, (draft) => {
        draft.WebUI_Settings.releaseInfoProviders = newWebuiProviderOrder;
      });
      patchSettings(newSettings);
    }
  };

  if (!initialized || !hashingProvidersQuery.data) {
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

        <div className="flex flex-col">
          <Checkbox
            id="hashing-provider-parallel-mode"
            isChecked={hashingSettings.ParallelMode}
            onChange={event => setHashingSettings({ ParallelMode: event.target.checked })}
            label="Parallel Mode"
            justify
          />

          <div className="w-[95%] text-xs opacity-65">
            {hashingSettings.ParallelMode
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
        </div>

        <div className="flex flex-col gap-y-2">
          <div className="flex items-center">
            Hashing Providers
          </div>

          <div className="flex min-h-10 flex-col rounded-lg border border-panel-border bg-panel-input p-4">
            {hashingProvidersQuery.data.map(provider => (
              <div key={provider.ID} className="flex justify-between">
                {provider.Name}
                <div className="flex items-center gap-x-1">
                  {provider.Configuration && (
                    <Button
                      className="text-button-primary"
                      onClick={() => {
                        setSelectedProvider(provider);
                        setShowHashTypesModal(true);
                      }}
                    >
                      <Icon path={mdiCog} size={1} />
                    </Button>
                  )}
                  <Button
                    className="text-button-primary"
                    onClick={() => dispatch(showProviderInfo(provider))}
                  >
                    <Icon path={mdiInformationVariantCircleOutline} size={1} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <ReleaseSettings />

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
          disabled={!unsavedChanges}
        >
          Save
        </Button>
      </div>

      <ProviderInfoModal />
      <HashTypesModal
        show={showHashTypesModal}
        onClose={() => setShowHashTypesModal(false)}
        provider={selectedProvider}
      />
    </>
  );
};

export default HashingAndReleaseSettings;
