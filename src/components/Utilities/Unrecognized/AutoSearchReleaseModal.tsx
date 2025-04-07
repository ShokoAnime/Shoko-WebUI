import React, { useEffect, useMemo, useState } from 'react';
import { mdiCog, mdiInformationVariantCircle } from '@mdi/js';
import Icon from '@mdi/react';
import { cloneDeep } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import ConfigurationModal from '@/components/Dialogs/ConfigurationModal';
import ProviderInfoModal from '@/components/Dialogs/ProviderInfoModal';
import DnDList from '@/components/DnDList/DnDList';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import useEventCallback from '@/hooks/useEventCallback';

import type { ReleaseProviderInfoType } from '@/core/types/api/release-info';
import type { DropResult } from '@hello-pangea/dnd';

type AutoSearchReleaseModalProps = {
  show: boolean;
  providers: ReleaseProviderInfoType[];
  onClose: () => void;
  onUpdateProviders: (providers: ReleaseProviderInfoType[]) => void;
};

const AutoSearchReleaseModal = (props: AutoSearchReleaseModalProps) => {
  const { onClose, onUpdateProviders, providers: initialProviders, show } = props;
  const [info, setInfo] = useState<{ show: boolean, provider: ReleaseProviderInfoType | null }>(
    () => ({ show: false, provider: null }),
  );
  const [config, setConfig] = useState<
    { show: boolean, configGuid: string | null, title: string, description: string }
  >(
    () => ({ show: false, configGuid: null, title: '', description: '' }),
  );
  const [providers, setProviders] = useState(() => initialProviders);
  const canSearch = useMemo(() => providers.some(pro => pro.IsEnabled), [providers]);
  const [debouncedCanSearch] = useDebounceValue(canSearch, 100);

  const handleToggleReleaseInfoProvider = useEventCallback(
    (event: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>) => {
      const id = event.currentTarget.id.slice(0, 36);
      const { checked } = event.currentTarget;
      const clonedProviders = cloneDeep(providers);
      clonedProviders.find(pro => pro.ID === id)!.IsEnabled = checked;
      setProviders(clonedProviders);
    },
  );

  const handleDrag = useEventCallback((result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    const clonedProviders = cloneDeep(providers);
    const [removed] = clonedProviders.splice(result.source.index, 1);
    clonedProviders.splice(result.destination.index, 0, removed);
    for (let priority = 0; priority < clonedProviders.length; priority += 1) {
      clonedProviders[priority].Priority = priority;
    }
    setProviders(clonedProviders);
  });

  const handleOpenInfo = useEventCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const id = event.currentTarget.id.slice(0, -'-info'.length);
    const provider = providers.find(item => item.ID === id)!;
    setInfo({ show: true, provider });
  });

  const handleCloseInfo = useEventCallback(() => {
    setInfo(prev => ({ ...prev, show: false }));
  });

  const handleOpenConfig = useEventCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const id = event.currentTarget.id.slice(0, -'-config'.length);

    const { Description: description, ID: configGuid, Name: title } = (providers.find(item => item.ID === id)!)
      .Configuration!;
    setConfig({ show: true, configGuid, title, description: description ?? '' });
  });

  const handleCloseConfig = useEventCallback(() => {
    setConfig(prev => ({ ...prev, show: false }));
  });

  const handleSearch = useEventCallback(() => {
    if (!canSearch) return;
    onUpdateProviders(providers);
    onClose();
  });

  const onKeyUp = useEventCallback((event: KeyboardEvent) => {
    if (!show || config.show || info.show) return;

    if (event.key === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
      onClose();
    } else if (event.key === 'Enter') {
      event.stopPropagation();
      event.preventDefault();
      handleSearch();
    }
  });

  useEffect(() => {
    if (show) {
      window.addEventListener('keydown', onKeyUp);
    }
    return () => {
      if (!show) return;
      window.removeEventListener('keydown', onKeyUp);
    };
  }, [onKeyUp, show]);

  useEffect(() => {
    setProviders(initialProviders);
  }, [initialProviders]);

  return (
    <ModalPanel
      show={providers.length > 0 && show}
      size="sm"
      onRequestClose={onClose}
      shouldCloseOnEsc={false}
      header="Auto Search for Release Info"
    >
      <div className="flex flex-col gap-y-2">
        <div>
          <div className="mt-2 flex justify-between">
            <span className="flex gap-x-1.5">
              Release Providers
              <span className="self-center text-xs opacity-65">(Drag to Reorder)</span>
            </span>
          </div>
          <div className="mt-2 flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
            <DnDList onDragEnd={handleDrag}>
              {providers.map((definition, index) => ({
                key: definition.ID,
                item: (
                  <Checkbox
                    autoFocus={index === 0}
                    id={`${definition.ID}-webui`}
                    isChecked={definition.IsEnabled}
                    onChange={handleToggleReleaseInfoProvider}
                    onClick={handleToggleReleaseInfoProvider}
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
            Enabled providers in the manual linking process, in priority order.
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-5 py-2">Cancel</Button>
        <Button onClick={handleSearch} buttonType="primary" className="px-5 py-2" disabled={!debouncedCanSearch}>
          Search
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
    </ModalPanel>
  );
};

export default AutoSearchReleaseModal;
