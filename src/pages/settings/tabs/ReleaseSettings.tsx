import { useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { mdiInformationVariantCircleOutline, mdiLoading } from '@mdi/js';
import Icon from '@mdi/react';
import { produce } from 'immer';
import { isEqual } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import ProviderInfoModal from '@/components/Dialogs/ProviderInfoModal';
import DnDList from '@/components/DnDList/DnDList';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InsetPanel from '@/components/Panels/InsetPanel';
import SettingsHeader from '@/components/Settings/SettingsHeader';
import { useUpdateReleaseInfoProvidersMutation } from '@/core/react-query/release-info/mutations';
import { useReleaseInfoProvidersQuery } from '@/core/react-query/release-info/queries';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { hideProviderInfo, showProviderInfo } from '@/core/slices/modals/providerInfo';
import { clearReleaseSettings, reorderProvider, setProviders, toggleProvider } from '@/core/slices/settings/release';
import { useDispatch, useSelector } from '@/core/store';
import toast from '@/core/toast';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { ReleaseProviderInfoType } from '@/core/react-query/release-info/types';
import type { SettingsType } from '@/core/types/api/settings';
import type { DropResult } from '@hello-pangea/dnd';

const buildProviderState = (settings: SettingsType, providersData: ReleaseProviderInfoType[]) => {
  const cleanWebuiProviders = settings.WebUI_Settings.releaseInfoProviders
    .map((webuiProvider) => {
      const foundProvider = providersData.find(provider => provider.ID === webuiProvider.id);
      if (!foundProvider) return undefined;
      return { ...foundProvider, IsEnabled: webuiProvider.enabled };
    })
    .filter(webuiProvider => !!webuiProvider);

  const existingIds = new Set(cleanWebuiProviders.map(provider => provider.ID));
  const newProviders = providersData.filter(provider => !existingIds.has(provider.ID));

  return {
    providers: providersData,
    webuiProviders: [...cleanWebuiProviders, ...newProviders],
  };
};

const ReleaseSettings = () => {
  const dispatch = useDispatch();
  const { initialized, providers, webuiProviders } = useSelector(state => state.settings.release);
  const { show: showProviderInfoModal } = useSelector(state => state.modals.providerInfo);

  const settings = useSettingsQuery().data;
  const releaseProvidersQuery = useReleaseInfoProvidersQuery();

  const { mutate: patchSettings } = usePatchSettingsMutation();
  const { mutate: updateReleaseInfoProviders } = useUpdateReleaseInfoProvidersMutation();

  const newWebuiProviderOrder = webuiProviders
    .map(provider => ({ id: provider.ID, enabled: provider.IsEnabled }));

  useEffect(() => {
    if (!releaseProvidersQuery.data) return;
    dispatch(setProviders(buildProviderState(settings, releaseProvidersQuery.data)));
  }, [dispatch, releaseProvidersQuery.data, settings]);

  const handleCancel = () => {
    if (releaseProvidersQuery.data) {
      dispatch(setProviders(buildProviderState(settings, releaseProvidersQuery.data)));
    }
  };

  useEffect(() => () => {
    dispatch(clearReleaseSettings());
    dispatch(hideProviderInfo());
  }, [dispatch]);

  const handleProviderReorder = (result: DropResult, type: 'server' | 'webui') => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    dispatch(reorderProvider({
      destinationIndex: result.destination.index,
      sourceIndex: result.source.index,
      type,
    }));
  };

  const handleProviderToggle = (event: ChangeEvent<HTMLInputElement>, type: 'server' | 'webui') => {
    const id = event.target.id.replace(`-${type}`, '');
    const { checked } = event.target;

    dispatch(toggleProvider({ checked, id, type }));
  };

  const toastId = useRef<number | string>(undefined);

  const releaseProvidersChanged = !isEqual(releaseProvidersQuery.data, providers);
  const webuiProvidersChanged = !isEqual(settings.WebUI_Settings.releaseInfoProviders, newWebuiProviderOrder);
  const unsavedChanges = initialized && (releaseProvidersChanged || webuiProvidersChanged);
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
    if (releaseProvidersChanged) {
      updateReleaseInfoProviders(providers);
    }

    if (webuiProvidersChanged) {
      patchSettings(produce(settings, (draft) => {
        draft.WebUI_Settings.releaseInfoProviders = newWebuiProviderOrder;
      }));
    }
  };

  useToggleModalKeybinds(!showProviderInfoModal, 'primary');

  if (!initialized) {
    return <Icon path={mdiLoading} size={4} spin className="m-auto text-panel-text-primary" />;
  }

  return (
    <>
      <SettingsHeader title="Releases">
        Configure which providers Shoko asks for the releases of your files, and in which order.
      </SettingsHeader>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">Release Provider Options</div>

        <div className="flex flex-col gap-y-2">
          <div className="flex items-center">
            Auto-Linking Release Providers&nbsp;
            <span className="text-xs opacity-65">(Drag to Reorder)</span>
          </div>

          <InsetPanel className="flex min-h-10 p-4">
            <DnDList onDragEnd={result => handleProviderReorder(result, 'server')}>
              {providers.map(provider => ({
                key: provider.ID,
                item: (
                  <Checkbox
                    id={`${provider.ID}-server`}
                    isChecked={provider.IsEnabled}
                    onChange={event => handleProviderToggle(event, 'server')}
                    labelRight
                    labelClassName="grow justify-between"
                    label={
                      <>
                        <div className="flex items-center">
                          {provider.Name}
                          &nbsp;
                          <span className="text-xs opacity-65">{provider.Plugin.Name}</span>
                        </div>

                        <div className="flex items-center gap-x-1">
                          {/* Temporarily disabled until configuration modal is added */}
                          {/* {provider.Configuration && ( */}
                          {/*   <Button className="text-button-primary"> */}
                          {/*     <Icon path={mdiCog} size={1} /> */}
                          {/*   </Button> */}
                          {/* )} */}
                          <Button
                            className="text-button-primary"
                            onClick={() => dispatch(showProviderInfo(provider))}
                          >
                            <Icon path={mdiInformationVariantCircleOutline} size={1} />
                          </Button>
                        </div>
                      </>
                    }
                  />
                ),
              }))}
            </DnDList>
          </InsetPanel>
          <div className="text-sm text-panel-text opacity-65">
            Enabled auto-search release providers in the automated linking process, in priority order.
          </div>
        </div>

        <div className="flex flex-col gap-y-2">
          <div className="flex items-center">
            Manual Linking Release Providers&nbsp;
            <span className="text-xs opacity-65">(Drag to Reorder)</span>
          </div>

          <InsetPanel className="flex min-h-10 p-4">
            <DnDList onDragEnd={result => handleProviderReorder(result, 'webui')}>
              {webuiProviders.map(provider => ({
                key: provider.ID,
                item: (
                  <Checkbox
                    id={`${provider.ID}-webui`}
                    isChecked={provider.IsEnabled}
                    onChange={event => handleProviderToggle(event, 'webui')}
                    labelRight
                    labelClassName="grow justify-between"
                    label={
                      <>
                        <div className="flex items-center">
                          {provider.Name}
                          &nbsp;
                          <span className="text-xs opacity-65">{provider.Plugin.Name}</span>
                        </div>

                        <div className="flex items-center gap-x-1">
                          {/* Temporarily disabled until configuration modal is added */}
                          {/* {provider.Configuration && ( */}
                          {/*   <Button className="text-button-primary"> */}
                          {/*     <Icon path={mdiCog} size={1} /> */}
                          {/*   </Button> */}
                          {/* )} */}
                          <Button
                            className="text-button-primary"
                            onClick={() => dispatch(showProviderInfo(provider))}
                          >
                            <Icon path={mdiInformationVariantCircleOutline} size={1} />
                          </Button>
                        </div>
                      </>
                    }
                  />
                ),
              }))}
            </DnDList>
          </InsetPanel>
          <div className="text-sm text-panel-text opacity-65">
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
          disabled={!unsavedChanges}
        >
          Save
        </Button>
      </div>

      <ProviderInfoModal />
    </>
  );
};

export default ReleaseSettings;
