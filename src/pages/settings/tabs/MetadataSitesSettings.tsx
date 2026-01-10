import React from 'react';
import { useTranslation } from 'react-i18next';

import TMDBDownloadSettings from '@/components/Settings/MetadataSitesSettings/TMDBDownloadSettings';
import TMDBSettings from '@/components/Settings/MetadataSitesSettings/TMDBSettings';
import useSettingsContext from '@/hooks/useSettingsContext';

const MetadataSitesSettings = () => {
  const { t } = useTranslation('settings');
  const { newSettings, setNewSettings, updateSetting } = useSettingsContext();

  return (
    <>
      <title>Settings &gt; Metadata Sites | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">{t('metadataSites.title')}</div>
        <div>
          {t('metadataSites.description')}
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">{t('metadataSites.tmdb')}</div>
        <div className="flex flex-col gap-y-1">
          <TMDBSettings newSettings={newSettings} setNewSettings={setNewSettings} updateSetting={updateSetting} />
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">{t('metadataSites.tmdbDownload')}</div>
        <div className="flex flex-col gap-y-1">
          <TMDBDownloadSettings newSettings={newSettings} updateSetting={updateSetting} />
        </div>
      </div>

      <div className="border-b border-panel-border" />
    </>
  );
};

export default MetadataSitesSettings;
