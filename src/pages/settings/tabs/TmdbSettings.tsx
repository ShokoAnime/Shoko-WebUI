import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { mdiFileExportOutline, mdiFileImportOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { produce } from 'immer';

import TmdbExportModal from '@/components/Dialogs/TmdbExportModal';
import TmdbImportModal from '@/components/Dialogs/TmdbImportModal';
import Button from '@/components/Input/Button';
import InputSmall from '@/components/Input/InputSmall';
import TMDBDownloadSettings from '@/components/Settings/MetadataSitesSettings/TMDBDownloadSettings';
import TMDBImageLanguageSettings from '@/components/Settings/MetadataSitesSettings/TMDBImageLanguageSettings';
import TMDBSettings from '@/components/Settings/MetadataSitesSettings/TMDBSettings';
import useSettingsContext from '@/hooks/useSettingsContext';

const TmdbSettings = () => {
  const { newSettings, setNewSettings, updateSetting } = useSettingsContext();

  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleUserApiKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    // The server only falls back to the built-in API key when this is null; an empty string would be used as the key.
    const value = event.target.value.trim() === '' ? null : event.target.value;
    setNewSettings(produce(newSettings, (draftState) => {
      draftState.TMDB.UserApiKey = value;
    }));
  };

  return (
    <>
      <title>Settings &gt; TMDB | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">TMDB</div>
        <div>
          Customize the information and images that Shoko downloads for the series in your collection
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">TMDB Options</div>
        <div className="flex flex-col gap-y-1">
          <TMDBSettings newSettings={newSettings} setNewSettings={setNewSettings} updateSetting={updateSetting} />
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">TMDB Download Options</div>
        <div className="flex flex-col gap-y-1">
          <TMDBDownloadSettings newSettings={newSettings} updateSetting={updateSetting} />
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">TMDB Image Language Options</div>
        <div className="flex flex-col gap-y-1">
          <TMDBImageLanguageSettings newSettings={newSettings} setNewSettings={setNewSettings} />
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">TMDB API Options</div>
        <div className="flex flex-col gap-y-1">
          <div className="flex justify-between">
            API Key
            <InputSmall
              id="TMDB_UserApiKey"
              value={newSettings.TMDB.UserApiKey ?? ''}
              type="password"
              autoComplete="new-password"
              onChange={handleUserApiKeyChange}
              className="w-60 px-3 py-1"
            />
          </div>
          <div className="text-xs opacity-65">
            Optional. Use your own TMDB API key instead of the one included in official builds.
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

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
              <Icon path={mdiFileExportOutline} size={0.85} />
              <span>Export</span>
            </Button>
            <Button
              buttonType="secondary"
              buttonSize="small"
              className="flex flex-row flex-wrap items-center gap-x-2"
              onClick={() => setShowImportModal(true)}
              tooltip="Import AniDB/TMDB cross-references from a CSV file"
            >
              <Icon path={mdiFileImportOutline} size={0.85} />
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

export default TmdbSettings;
