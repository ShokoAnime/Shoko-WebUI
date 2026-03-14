import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiInformationVariantCircleOutline, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import DnDList from '@/components/DnDList/DnDList';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import { useReleaseInfoProvidersQuery, useReleaseInfoSummaryQuery } from '@/core/react-query/release-info/queries';
import { showProviderInfo } from '@/core/slices/modals/providerInfo';
import { reorderProvider, setReleaseInfoSettings, toggleProvider } from '@/core/slices/settings/release';

import type { RootState } from '@/core/store';
import type { DropResult } from '@hello-pangea/dnd';

const ReleaseSettings = () => {
  const dispatch = useDispatch();

  const { providers, releaseInfoSettings, webuiProviders } = useSelector((state: RootState) => state.settings.release);

  const releaseProvidersQuery = useReleaseInfoProvidersQuery();
  const releaseProviderSummaryQuery = useReleaseInfoSummaryQuery();

  const handleToggleParallelMode = () => {
    dispatch(setReleaseInfoSettings({
      ParallelMode: !releaseInfoSettings.ParallelMode,
    }));
  };

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

  const handleProviderToggle = (event: React.ChangeEvent<HTMLInputElement>, type: 'server' | 'webui') => {
    const id = event.target.id.replace(`-${type}`, '');
    const { checked } = event.target;

    dispatch(toggleProvider({ checked, id, type }));
  };

  if (!releaseProvidersQuery.isSuccess || !releaseProviderSummaryQuery.isSuccess) {
    return <Icon path={mdiLoading} size={4} spin className="m-auto text-panel-text-primary" />;
  }

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center font-semibold">Release Provider Options</div>

      <div className="flex flex-col">
        <Checkbox
          id="release-provider-parallel-mode"
          isChecked={!!releaseInfoSettings.ParallelMode}
          onChange={handleToggleParallelMode}
          label="Parallel Mode"
          justify
        />

        <div className="w-[95%] text-xs opacity-65">
          {releaseInfoSettings.ParallelMode
            ? 'Run all enabled providers in parallel, and wait for the highest priority valid result.'
            : 'Run each provider in sequential order defined by the priority below until a valid result is found.'}
        </div>
      </div>

      <div className="flex flex-col gap-y-2">
        <div className="flex items-center">
          Auto-Linking Release Providers&nbsp;
          <span className="text-xs opacity-65">(Drag to Reorder)</span>
        </div>

        <div className="flex min-h-10 rounded-lg border border-panel-border bg-panel-input p-4">
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
        </div>
        <div className="text-sm text-panel-text opacity-65">
          Enabled auto-search release providers in the automated linking process, in priority order.
        </div>
      </div>

      <div className="flex flex-col gap-y-2">
        <div className="flex items-center">
          Manual Linking Release Providers&nbsp;
          <span className="text-xs opacity-65">(Drag to Reorder)</span>
        </div>

        <div className="flex min-h-10 rounded-lg border border-panel-border bg-panel-input p-4">
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
        </div>
        <div className="text-sm text-panel-text opacity-65">
          Enabled auto-search release providers in the manual linking process, in priority order.
        </div>
      </div>
    </div>
  );
};

export default ReleaseSettings;
