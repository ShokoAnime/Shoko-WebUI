import React from 'react';
import { useTranslation } from 'react-i18next';

import PlexSettings from '@/components/Settings/MetadataSitesSettings/PlexSettings';
import TraktSettings from '@/components/Settings/MetadataSitesSettings/TraktSettings';

const IntegrationsSettings = () => {
  const { t } = useTranslation('settings');
  return (
    <>
      <title>Settings &gt; Integrations | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">{t('integrations.title')}</div>
        <div>
          {t('integrations.description')}
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <TraktSettings />
      <div className="border-b border-panel-border" />
      <PlexSettings />
      <div className="border-b border-panel-border" />
    </>
  );
};

export default IntegrationsSettings;
