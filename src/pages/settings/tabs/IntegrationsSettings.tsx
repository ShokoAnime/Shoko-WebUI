import PlexSettings from '@/components/Settings/MetadataSitesSettings/PlexSettings';
import SettingsDivider from '@/components/Settings/SettingsDivider';
import SettingsHeader from '@/components/Settings/SettingsHeader';

const IntegrationsSettings = () => (
  <>
    <SettingsHeader title="Integrations">
      Customize the integrations that Shoko uses to scrobble your media
    </SettingsHeader>

    <SettingsDivider />

    <PlexSettings />
    <SettingsDivider />
  </>
);

export default IntegrationsSettings;
