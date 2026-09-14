import AnilistDownloadSettings from '@/components/Settings/MetadataSitesSettings/AnilistDownloadSettings';
import AnilistSettingsOptions from '@/components/Settings/MetadataSitesSettings/AnilistSettings';
import useSettingsContext from '@/hooks/useSettingsContext';

const AnilistSettings = () => {
  const { newSettings, setNewSettings, updateSetting } = useSettingsContext();

  return (
    <>
      <title>Settings &gt; AniList | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">AniList</div>
        <div>
          Customize the information and images that Shoko downloads for the series in your collection
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">AniList Options</div>
        <div className="flex flex-col gap-y-1">
          <AnilistSettingsOptions
            newSettings={newSettings}
            setNewSettings={setNewSettings}
            updateSetting={updateSetting}
          />
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">AniList Download Options</div>
        <div className="flex flex-col gap-y-1">
          <AnilistDownloadSettings newSettings={newSettings} updateSetting={updateSetting} />
        </div>
      </div>

      <div className="border-b border-panel-border" />
    </>
  );
};

export default AnilistSettings;
