import { useState } from 'react';
import { mdiFileExportOutline, mdiFileImportOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import TmdbExportModal from '@/components/Dialogs/TmdbExportModal';
import TmdbImportModal from '@/components/Dialogs/TmdbImportModal';
import Button from '@/components/Input/Button';
import TMDBDownloadSettings from '@/components/Settings/MetadataSitesSettings/TMDBDownloadSettings';
import TMDBImageLanguageSettings from '@/components/Settings/MetadataSitesSettings/TMDBImageLanguageSettings';
import TMDBSettings from '@/components/Settings/MetadataSitesSettings/TMDBSettings';
import useSettingsContext from '@/hooks/useSettingsContext';

const TmdbSettings = () => {
  const { newSettings, setNewSettings, updateSetting } = useSettingsContext();

  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

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
