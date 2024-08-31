import React from 'react';

import PlexSettings from '@/components/Settings/MetadataSitesSettings/PlexSettings';
import TMDBSettings from '@/components/Settings/MetadataSitesSettings/TMDBSettings';
import TraktSettings from '@/components/Settings/MetadataSitesSettings/TraktSettings';
import useSettingsContext from '@/hooks/useSettingsContext';

function MetadataSitesSettings() {
  const { newSettings, setNewSettings, updateSetting } = useSettingsContext();

  return (
    <>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">Metadata Sites</div>
        <div>
          Customize the information and images that Shoko downloads for the series in your collection
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex h-[2.149rem] items-center font-semibold">TMDB Options</div>
        <div className="flex flex-col gap-y-1">
          <TMDBSettings newSettings={newSettings} setNewSettings={setNewSettings} updateSetting={updateSetting} />
        </div>
      </div>

      <div className="border-b border-panel-border" />
      <TraktSettings />
      <div className="border-b border-panel-border" />
      <PlexSettings />
      <div className="border-b border-panel-border" />
    </>
  );
}

export default MetadataSitesSettings;
