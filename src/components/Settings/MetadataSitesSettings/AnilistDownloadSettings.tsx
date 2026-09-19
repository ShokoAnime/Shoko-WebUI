import type { ChangeEventHandler } from 'react';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';

import type { SettingsContextType } from '@/core/types/context';

type Props = Omit<SettingsContextType, 'setNewSettings'>;

const AnilistDownloadSettings = (props: Props) => {
  const { newSettings, updateSetting } = props;

  const {
    AutoDownloadBanners,
    AutoDownloadCharacters,
    AutoDownloadPosters,
    AutoDownloadStaff,
    AutoDownloadStudios,
    AutoPurgeUnlinkedAfterDays,
    AutoSearchCandidateCount,
  } = newSettings.Anilist;

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const propId = event.target.id.replace('Anilist_', '');
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    updateSetting('Anilist', propId, value);
  };

  return (
    <>
      <Checkbox
        justify
        label="Download Staff"
        id="Anilist_AutoDownloadStaff"
        isChecked={AutoDownloadStaff}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label="Download Characters"
        id="Anilist_AutoDownloadCharacters"
        isChecked={AutoDownloadCharacters}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label="Download Studios"
        id="Anilist_AutoDownloadStudios"
        isChecked={AutoDownloadStudios}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label="Download Posters"
        id="Anilist_AutoDownloadPosters"
        isChecked={AutoDownloadPosters}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label="Download Banners"
        id="Anilist_AutoDownloadBanners"
        isChecked={AutoDownloadBanners}
        onChange={handleInputChange}
      />
      <div className="flex items-center justify-between">
        Auto-Search Candidate Count
        <InputSmall
          id="Anilist_AutoSearchCandidateCount"
          value={AutoSearchCandidateCount}
          type="number"
          min={1}
          max={20}
          onChange={handleInputChange}
          className="w-12 px-3 py-1"
        />
      </div>
      <div className="flex items-center justify-between">
        Purge Unlinked Anime After (Days)
        <InputSmall
          id="Anilist_AutoPurgeUnlinkedAfterDays"
          value={AutoPurgeUnlinkedAfterDays}
          type="number"
          min={0}
          max={365}
          onChange={handleInputChange}
          className="w-16 px-3 py-1"
        />
      </div>
    </>
  );
};

export default AnilistDownloadSettings;
