import { useEffect, useRef, useState } from 'react';
import { mdiCog, mdiInformationVariantCircleOutline, mdiLoading } from '@mdi/js';
import Icon from '@mdi/react';
import { useDebounceValue } from 'usehooks-ts';

import HashTypesModal from '@/components/Dialogs/HashTypesModal';
import ProviderInfoModal from '@/components/Dialogs/ProviderInfoModal';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InsetPanel from '@/components/Panels/InsetPanel';
import SettingsHeader from '@/components/Settings/SettingsHeader';
import { useUpdateHashingSettingsMutation } from '@/core/react-query/hashing/mutations';
import { useHashingProvidersQuery, useHashingSummaryQuery } from '@/core/react-query/hashing/queries';
import { hideProviderInfo, showProviderInfo } from '@/core/slices/modals/providerInfo';
import { useDispatch, useSelector } from '@/core/store';
import toast from '@/core/toast';
import useSyncedState from '@/hooks/useSyncedState';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { HashProviderInfoType, HashingSummaryType } from '@/core/react-query/hashing/types';

const DEFAULT_HASHING_SETTINGS: HashingSummaryType = { ParallelMode: false };

const HashingSettings = () => {
  const dispatch = useDispatch();
  const { show: showProviderInfoModal } = useSelector(state => state.modals.providerInfo);

  const hashingProvidersQuery = useHashingProvidersQuery();
  const hashingSummaryQuery = useHashingSummaryQuery();

  const { mutate: updateHashingSettings } = useUpdateHashingSettingsMutation();

  const [showHashTypesModal, setShowHashTypesModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<HashProviderInfoType | undefined>();
  const [hashingSettings, setHashingSettings] = useSyncedState<HashingSummaryType | undefined, HashingSummaryType>(
    hashingSummaryQuery.data,
    data => data ?? DEFAULT_HASHING_SETTINGS,
  );

  const handleCancel = () => {
    if (hashingSummaryQuery.data) setHashingSettings(hashingSummaryQuery.data);
  };

  useEffect(() => () => {
    dispatch(hideProviderInfo());
  }, [dispatch]);

  const toastId = useRef<number | string>(undefined);

  const unsavedChanges = hashingSummaryQuery.isSuccess
    && hashingSummaryQuery.data.ParallelMode !== hashingSettings.ParallelMode;
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

  const handleSave = () => {
    updateHashingSettings({ ParallelMode: hashingSettings.ParallelMode });
  };

  useToggleModalKeybinds(!showHashTypesModal && !showProviderInfoModal, 'primary');

  if (!hashingSummaryQuery.isSuccess || !hashingProvidersQuery.data) {
    return <Icon path={mdiLoading} size={4} spin className="m-auto text-panel-text-primary" />;
  }

  return (
    <>
      <SettingsHeader title="Hashing">
        Configure how Shoko hashes files.
      </SettingsHeader>

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

          <InsetPanel className="flex min-h-10 flex-col p-4">
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
          </InsetPanel>
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

export default HashingSettings;
