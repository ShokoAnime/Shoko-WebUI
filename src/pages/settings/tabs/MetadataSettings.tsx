import { useState } from 'react';
import { mdiExport, mdiImport } from '@mdi/js';
import { Icon } from '@mdi/react';
import { toNumber } from 'lodash';

import MetadataSourceIcon from '@/components/Collection/MetadataSourceIcon';
import MetadataExportModal from '@/components/Dialogs/MetadataExportModal';
import MetadataImportModal from '@/components/Dialogs/MetadataImportModal';
import Button from '@/components/Input/Button';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import MetadataSearchSettings from '@/components/Settings/MetadataSitesSettings/MetadataSearchSettings';
import MetadataSourceList from '@/components/Settings/MetadataSitesSettings/MetadataSourceList';
import SettingsDivider from '@/components/Settings/SettingsDivider';
import SettingsHeader from '@/components/Settings/SettingsHeader';
import SettingsSection from '@/components/Settings/SettingsSection';
import { useMetadataLinkSourcesQuery } from '@/core/react-query/metadata/queries';
import useSettingsContext from '@/hooks/useSettingsContext';

const MetadataSettings = () => {
  const { metadataDraft, newSettings, setMetadataDraft, setNewSettings, updateSetting } = useSettingsContext();

  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const linkSourcesQuery = useMetadataLinkSourcesQuery();

  // Links are exported and imported for one source at a time, the first one until another is picked.
  const linkSources = linkSourcesQuery.data ?? [];
  const [pickedSource, setPickedSource] = useState('');
  const crossReferenceSource = linkSources.find(item => item.Source === pickedSource) ?? linkSources[0];
  const crossReferenceName = crossReferenceSource?.Name ?? '';

  const { AutoPurgeUnlinkedAfterDays, PurgeOrphanedAfterDays } = newSettings.Metadata;

  return (
    <>
      <SettingsHeader title="Metadata">
        Choose the sources and providers Shoko gets information and images from for the series in your collection.
        Everything here, the providers and auto-linking included, waits for Save at the bottom of the page, except each
        provider&apos;s own settings, which are saved with their own button.
      </SettingsHeader>

      <SettingsDivider />

      <SettingsSection title="General Options">
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
          <MetadataSearchSettings newSettings={newSettings} setNewSettings={setNewSettings} />
        </div>
      </SettingsSection>

      <SettingsDivider />

      <MetadataSourceList
        metadataDraft={metadataDraft}
        newSettings={newSettings}
        setMetadataDraft={setMetadataDraft}
        setNewSettings={setNewSettings}
      />

      <SettingsSection title="Cross-References">
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
      </SettingsSection>

      <SettingsDivider />

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
