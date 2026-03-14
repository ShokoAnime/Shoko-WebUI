import React, { useEffect, useMemo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useDispatch } from 'react-redux';
import { mdiInformationVariantCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useImmer } from 'use-immer';

import ProviderInfoModal from '@/components/Dialogs/ProviderInfoModal';
import DnDList from '@/components/DnDList/DnDList';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useReleaseInfoProvidersQuery } from '@/core/react-query/release-info/queries';
import { hideProviderInfo, showProviderInfo } from '@/core/slices/modals/providerInfo';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { ManualLinkProviderType } from '@/core/types/utilities/unrecognized-utility';
import type { DropResult } from '@hello-pangea/dnd';

type Props = {
  initialProviders: ManualLinkProviderType[];
  onClose: () => void;
  onUpdateProviders: (providers: ManualLinkProviderType[]) => void;
  show: boolean;
};

const AutoSearchReleaseModal = (props: Props) => {
  const { initialProviders, onClose, onUpdateProviders, show } = props;
  const dispatch = useDispatch();

  const providersQuery = useReleaseInfoProvidersQuery();
  const providerMap = useMemo(() => {
    if (!providersQuery.data) return {};
    return Object.fromEntries(providersQuery.data.map(provider => [provider.ID, provider]));
  }, [providersQuery.data]);

  const [providers, setProviders] = useImmer<ManualLinkProviderType[]>([]);

  useEffect(() => {
    if (!providersQuery.data) return;

    if (!show) {
      dispatch(hideProviderInfo());
      return;
    }

    const newProviders: ManualLinkProviderType[] = [];
    const addedProviderIds = new Set<string>();

    initialProviders.forEach((provider) => {
      if (Object.keys(providerMap).includes(provider.id)) {
        newProviders.push(provider);
        addedProviderIds.add(provider.id);
      }
    });

    providersQuery.data.forEach((provider) => {
      if (!addedProviderIds.has(provider.ID)) {
        newProviders.push({
          id: provider.ID,
          enabled: false,
        });
        addedProviderIds.add(provider.ID);
      }
    });

    setProviders(newProviders);
  }, [initialProviders, setProviders, providerMap, providersQuery.data, show, dispatch]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    setProviders((draftState) => {
      const [reorderedItem] = draftState.splice(result.source.index, 1);
      draftState.splice(result.destination!.index, 0, reorderedItem);
    });
  };

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, id } = event.target;

    setProviders((draftState) => {
      const item = draftState.find(provider => provider.id === id);
      if (item) item.enabled = checked;
    });
  };

  const handleSearch = () => {
    onUpdateProviders(providers);
    onClose();
  };

  const handleShowInfoModal = (providerId: string) => {
    if (!providerMap[providerId]) return;
    dispatch(showProviderInfo(providerMap[providerId]));
  };

  useToggleModalKeybinds(show);
  useHotkeys('escape', onClose, { scopes: 'modal' });
  useHotkeys('enter', handleSearch, { scopes: 'modal' });

  return (
    <ModalPanel
      show={show}
      size="sm"
      onRequestClose={onClose}
      header="Auto Search for Release Info"
    >
      <div className="flex flex-col gap-y-2">
        <div className="mt-2 flex justify-between">
          <span className="flex gap-x-1.5">
            Release Providers
            <span className="self-center text-xs opacity-65">(Drag to Reorder)</span>
          </span>
        </div>
        <div className="mt-2 flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
          <DnDList onDragEnd={onDragEnd}>
            {providers.map((provider, index) => (
              {
                key: provider.id,
                item: (
                  <Checkbox
                    autoFocus={index === 0}
                    id={provider.id}
                    isChecked={provider.enabled}
                    onChange={handleToggle}
                    labelRight
                    justify
                    className="grow"
                    labelClassName="grow"
                    label={
                      <>
                        <span className="flex grow gap-x-1.5">
                          {providerMap[provider.id].Name}
                          <span className="self-center text-xs opacity-65">
                            (
                            {providerMap[provider.id].Plugin.Name}
                            )
                          </span>
                        </span>
                        <span className="flex gap-x-1">
                          {/* Temporarily disabled until configuration modal is added */}
                          {/* {providerMap[provider.id].Configuration && ( */}
                          {/*   <Button */}
                          {/*     id={`${provider.id}-config`} */}
                          {/*     className="text-button-primary opacity-65 cursor-default" */}
                          {/*   > */}
                          {/*     <Icon path={mdiCog} size={1} /> */}
                          {/*   </Button> */}
                          {/* )} */}
                          <Button
                            id={`${provider.id}-info`}
                            onClick={() => handleShowInfoModal(provider.id)}
                            className="text-button-primary"
                          >
                            <Icon path={mdiInformationVariantCircleOutline} size={1} />
                          </Button>
                        </span>
                      </>
                    }
                  />
                ),
              }
            ))}
          </DnDList>
        </div>
        <div className="mt-1 text-sm text-panel-text opacity-65">
          Enabled providers in the manual linking process, in priority order.
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button
          onClick={onClose}
          buttonType="secondary"
          className="px-5 py-2"
          keybinding="Esc"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSearch}
          buttonType="primary"
          className="px-5 py-2"
          disabled={!providers.length}
          keybinding="Enter"
        >
          Search
        </Button>
      </div>

      <ProviderInfoModal />
    </ModalPanel>
  );
};

export default AutoSearchReleaseModal;
