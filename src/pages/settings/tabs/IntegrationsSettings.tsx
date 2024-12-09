import React from 'react';

import PlexSettings from '@/components/Settings/MetadataSitesSettings/PlexSettings';
import TraktSettings from '@/components/Settings/MetadataSitesSettings/TraktSettings';

const IntegrationsSettings = () => (
  <>
    <title>Settings &gt; Integrations | Shoko</title>
    <div className="flex flex-col gap-y-1">
      <div className="text-xl font-semibold">Integrations</div>
      <div>
        Customize the integrations that Shoko uses to scrobble your media
      </div>
    </div>

    <div className="border-b border-panel-border" />

    <TraktSettings />
    <div className="border-b border-panel-border" />
    <PlexSettings />
    <div className="border-b border-panel-border" />
  </>
);

export default IntegrationsSettings;
