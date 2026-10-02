import { useState } from 'react';
import { mdiExport, mdiImport, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { produce } from 'immer';
import { toNumber } from 'lodash';

import MetadataSourceIcon from '@/components/Collection/MetadataSourceIcon';
import MetadataExportModal from '@/components/Dialogs/MetadataExportModal';
import MetadataImportModal from '@/components/Dialogs/MetadataImportModal';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import MetadataImageSettings from '@/components/Settings/MetadataSitesSettings/MetadataImageSettings';
import MetadataSourceSettings from '@/components/Settings/MetadataSitesSettings/MetadataSourceSettings';
import { getMetadataSources } from '@/core/react-query/metadata/helpers';
import { useMetadataLinkSourcesQuery, useMetadataProvidersQuery } from '@/core/react-query/metadata/queries';
import useSettingsContext from '@/hooks/useSettingsContext';

import type { SettingsMetadataImageType } from '@/core/types/api/settings';

const MetadataSettings = () => {
  const { newSettings, setNewSettings, updateSetting } = useSettingsContext();

  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const providersQuery = useMetadataProvidersQuery();
  const linkSourcesQuery = useMetadataLinkSourcesQuery();
  const sources = getMetadataSources(providersQuery.data ?? [], linkSourcesQuery.data);

  // Links are exported and imported for one source at a time, the first one until another is picked.
  const linkSources = linkSourcesQuery.data ?? [];
  const [pickedSource, setPickedSource] = useState('');
  const crossReferenceSource = linkSources.find(item => item.Source === pickedSource) ?? linkSources[0];
  const crossReferenceName = crossReferenceSource?.Name ?? '';

  const { includeRestricted } = newSettings.WebUI_Settings.collection.tmdb;

  const { MetadataSourceDefaults: imageDefaults, MetadataSources: sourceImages } = newSettings.Image;
  const { AutoPurgeUnlinkedAfterDays, PurgeOrphanedAfterDays } = newSettings.Metadata;

  const findSourceImages = (source: string) =>
    sourceImages.findIndex(item => item.Source.toLowerCase() === source.toLowerCase());

  // `null` drops the source's own image options, so it follows the defaults again.
  const setSourceImages = (source: string, value: SettingsMetadataImageType | null) => {
    setNewSettings(produce(newSettings, (draftState) => {
      const index = findSourceImages(source);
      const entries = draftState.Image.MetadataSources;
      if (value === null) {
        if (index !== -1) entries.splice(index, 1);
      } else if (index === -1) {
        entries.push({ ...value, Source: source });
      } else {
        entries[index] = { ...value, Source: entries[index].Source };
      }
    }));
  };

  const setImageDefaults = (value: SettingsMetadataImageType) => {
    setNewSettings(produce(newSettings, (draftState) => {
      draftState.Image.MetadataSourceDefaults = value;
    }));
  };

  const handleIncludeRestrictedChange = (value: boolean) => {
    setNewSettings(produce(newSettings, (draftState) => {
      draftState.WebUI_Settings.collection.tmdb.includeRestricted = value;
    }));
  };

  return (
    <>
      <title>Settings &gt; Metadata | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">Metadata</div>
        <div>
          Choose the sources and providers Shoko gets information and images from for the series in your collection.
          Everything here, the providers and auto-linking included, waits for Save at the bottom of the page, except
          each provider&apos;s own settings, which are saved with their own button.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">General Options</div>
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            Purge Orphaned Metadata After (Days)
            <InputSmall
              id="Metadata_PurgeOrphanedAfterDays"
              value={PurgeOrphanedAfterDays}
              type="number"
              min={1}
              max={365}
              onChange={event => updateSetting('Metadata', 'PurgeOrphanedAfterDays', toNumber(event.target.value))}
              className="w-16 px-3 py-1"
            />
          </div>
          <div className="flex items-center justify-between">
            Purge Unlinked Metadata After (Days)
            <InputSmall
              id="Metadata_AutoPurgeUnlinkedAfterDays"
              value={AutoPurgeUnlinkedAfterDays}
              type="number"
              min={0}
              max={365}
              onChange={event => updateSetting('Metadata', 'AutoPurgeUnlinkedAfterDays', toNumber(event.target.value))}
              className="w-16 px-3 py-1"
            />
          </div>
          <div className="text-sm opacity-65">
            Unlinked series, movies and collections are kept forever at 0 days.
          </div>
          <Checkbox
            justify
            label="Include Restricted in Search"
            id="metadata-include-restricted"
            isChecked={includeRestricted}
            onChange={event => handleIncludeRestrictedChange(event.target.checked)}
          />
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-1">
          <div className="font-semibold">Image Options</div>
          <div className="text-sm opacity-65">For every source without image options of its own.</div>
        </div>
        <div className="flex flex-col gap-y-1">
          <MetadataImageSettings id="metadata-images" settings={imageDefaults} onChange={setImageDefaults} />
        </div>
      </div>

      <div className="border-b border-panel-border" />

      {providersQuery.isPending && (
        <div className="flex justify-center text-panel-text-primary">
          <Icon path={mdiLoading} size={2} spin />
        </div>
      )}
      {providersQuery.isSuccess && sources.length === 0 && (
        <>
          <div className="opacity-65">No metadata provider is registered.</div>
          <div className="border-b border-panel-border" />
        </>
      )}
      {sources.map(summary => (
        <div key={summary.source} className="flex flex-col gap-y-6">
          <MetadataSourceSettings summary={summary}>
            {summary.providers.some(provider => provider.SupportsImages) && (
              <div className="flex flex-col gap-y-1">
                <Checkbox
                  justify
                  label="Use Own Image Options"
                  id={`metadata-${summary.source}-own-images`}
                  isChecked={findSourceImages(summary.source) !== -1}
                  onChange={event => setSourceImages(summary.source, event.target.checked ? imageDefaults : null)}
                />
                {findSourceImages(summary.source) !== -1 && (
                  <MetadataImageSettings
                    id={`metadata-${summary.source}-images`}
                    settings={sourceImages[findSourceImages(summary.source)]}
                    onChange={value => setSourceImages(summary.source, value)}
                  />
                )}
              </div>
            )}
          </MetadataSourceSettings>
          <div className="border-b border-panel-border" />
        </div>
      ))}

      <div className="flex flex-col gap-y-6">
        <div className="font-semibold">Cross-References</div>
        <div>
          Back up or restore the links between your AniDB anime and the series, movies and episodes of a source, or
          share them with another Shoko Server.
        </div>
        {linkSources.length === 0
          ? <div className="opacity-65">No source can be linked to.</div>
          : (
            <div className="flex items-center justify-between gap-x-2">
              <div className="flex items-center gap-x-2">
                {crossReferenceSource && (
                  <MetadataSourceIcon hasIcon={crossReferenceSource.HasIcon} source={crossReferenceSource.Source} />
                )}
                <SelectSmall
                  id="metadata-cross-reference-source"
                  value={crossReferenceSource?.Source ?? ''}
                  onChange={event => setPickedSource(event.target.value)}
                >
                  {linkSources.map(item => <option key={item.Source} value={item.Source}>{item.Name}</option>)}
                </SelectSmall>
              </div>
              <div className="flex gap-x-2">
                <Button
                  buttonType="secondary"
                  buttonSize="small"
                  className="flex flex-row flex-wrap items-center gap-x-2"
                  onClick={() => setShowExportModal(true)}
                  tooltip={`Export AniDB/${crossReferenceName} cross-references to a CSV file`}
                >
                  <Icon path={mdiExport} size={0.85} />
                  <span>Export</span>
                </Button>
                <Button
                  buttonType="secondary"
                  buttonSize="small"
                  className="flex flex-row flex-wrap items-center gap-x-2"
                  onClick={() => setShowImportModal(true)}
                  tooltip={`Import AniDB/${crossReferenceName} cross-references from a CSV file`}
                >
                  <Icon path={mdiImport} size={0.85} />
                  <span>Import</span>
                </Button>
              </div>
            </div>
          )}
      </div>

      <div className="border-b border-panel-border" />

      {crossReferenceSource && (
        <>
          <MetadataExportModal
            show={showExportModal}
            onClose={() => setShowExportModal(false)}
            source={crossReferenceSource.Source}
            sourceName={crossReferenceName}
          />
          <MetadataImportModal
            show={showImportModal}
            onClose={() => setShowImportModal(false)}
            source={crossReferenceSource.Source}
            sourceName={crossReferenceName}
          />
        </>
      )}
    </>
  );
};

export default MetadataSettings;
