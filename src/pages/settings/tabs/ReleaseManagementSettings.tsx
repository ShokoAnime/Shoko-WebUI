import ReleaseComparisonSettings from '@/components/Settings/ReleaseComparisonSettings';
import SettingsHeader from '@/components/Settings/SettingsHeader';
import useSettingsContext from '@/hooks/useSettingsContext';

const ReleaseManagementSettings = () => {
  const { newSettings, setNewSettings } = useSettingsContext();

  return (
    <>
      <SettingsHeader title="Release Management">
        Configure how Shoko ranks the releases of an episode against each other, and when it may delete the files of the
        lesser ones.
      </SettingsHeader>

      <div className="border-b border-panel-border" />

      <ReleaseComparisonSettings
        preferences={newSettings.ReleaseComparisonPreferences}
        onChange={preferences => setNewSettings({ ...newSettings, ReleaseComparisonPreferences: preferences })}
      />

      <div className="border-b border-panel-border" />
    </>
  );
};

export default ReleaseManagementSettings;
