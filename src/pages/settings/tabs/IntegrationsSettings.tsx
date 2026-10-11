import PlexSettings from '@/components/Settings/MetadataSitesSettings/PlexSettings';
import SettingsHeader from '@/components/Settings/SettingsHeader';

const IntegrationsSettings = () => (
  <>
    <SettingsHeader title="Integrations">
      Customize the integrations that Shoko uses to scrobble your media
    </SettingsHeader>

    <div className="border-b border-panel-border" />

    <PlexSettings />
    <div className="border-b border-panel-border" />
  </>
);

export default IntegrationsSettings;
