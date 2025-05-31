import React from 'react';

import TMDBDownloadSettings from '@/components/Settings/MetadataSitesSettings/TMDBDownloadSettings';
import TMDBSettings from '@/components/Settings/MetadataSitesSettings/TMDBSettings';
import useSettingsContext from '@/hooks/useSettingsContext';

const MetadataSitesSettings = () => {
  const { newSettings, setNewSettings, updateSetting } = useSettingsContext();

  return (
    <>
      <title>Settings &gt; Metadata Sites | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">Metadata Sites</div>
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
    </>
  );
};

export default MetadataSitesSettings;
