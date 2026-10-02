import { useState } from 'react';
import { mdiExport, mdiImport } from '@mdi/js';
import { Icon } from '@mdi/react';
import { toNumber } from 'lodash';

import TmdbExportModal from '@/components/Dialogs/TmdbExportModal';
import TmdbImportModal from '@/components/Dialogs/TmdbImportModal';
import Button from '@/components/Input/Button';
import InputSmall from '@/components/Input/InputSmall';
import MetadataSearchSettings from '@/components/Settings/MetadataSitesSettings/MetadataSearchSettings';
import MetadataSourceList from '@/components/Settings/MetadataSitesSettings/MetadataSourceList';
import useSettingsContext from '@/hooks/useSettingsContext';

const MetadataSettings = () => {
  const { metadataDraft, newSettings, setMetadataDraft, setNewSettings, updateSetting } = useSettingsContext();

  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const { AutoPurgeUnlinkedAfterDays, PurgeOrphanedAfterDays } = newSettings.Metadata;

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
          <MetadataSearchSettings newSettings={newSettings} setNewSettings={setNewSettings} />
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <MetadataSourceList
        metadataDraft={metadataDraft}
        newSettings={newSettings}
        setMetadataDraft={setMetadataDraft}
        setNewSettings={setNewSettings}
      />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Cross-References</div>
          <div className="flex gap-x-2">
            <Button
              buttonType="secondary"
              buttonSize="small"
              className="flex flex-row flex-wrap items-center gap-x-2"
              onClick={() => setShowExportModal(true)}
              tooltip="Export AniDB/TMDB cross-references to a CSV file"
            >
              <Icon path={mdiExport} size={0.85} />
              <span>Export</span>
            </Button>
            <Button
              buttonType="secondary"
              buttonSize="small"
              className="flex flex-row flex-wrap items-center gap-x-2"
              onClick={() => setShowImportModal(true)}
              tooltip="Import AniDB/TMDB cross-references from a CSV file"
            >
              <Icon path={mdiImport} size={0.85} />
              <span>Import</span>
            </Button>
          </div>
        </div>
        <div>
          Back up or restore the links between your AniDB anime and TMDB movies, shows and episodes, or share them with
          another Shoko Server.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <TmdbExportModal show={showExportModal} onClose={() => setShowExportModal(false)} />
      <TmdbImportModal show={showImportModal} onClose={() => setShowImportModal(false)} />
    </>
  );
};

export default MetadataSettings;
