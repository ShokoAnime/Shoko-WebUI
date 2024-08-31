import React from 'react';
import cx from 'classnames';
import { produce } from 'immer';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import useEventCallback from '@/hooks/useEventCallback';

import type { SettingsContextType } from '@/core/types/context';

type Props = SettingsContextType;

const TMDBSettings = React.memo((props: Props) => {
  const { newSettings, setNewSettings, updateSetting } = props;

  const {
    AutoDownloadAlternateOrdering,
    AutoDownloadBackdrops,
    AutoDownloadCollections,
    AutoDownloadCrewAndCast,
    AutoDownloadLogos,
    AutoDownloadPosters,
    AutoDownloadStaffImages,
    AutoDownloadStudioImages,
    AutoDownloadThumbnails,
    AutoLink,
    AutoLinkRestricted,
    MaxAutoBackdrops,
    MaxAutoLogos,
    MaxAutoPosters,
    MaxAutoStaffImages,
    MaxAutoThumbnails,
  } = newSettings.TMDB;

  const { includeRestricted } = newSettings.WebUI_Settings.collection.tmdb;

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = useEventCallback((event) => {
    const propId = event.target.id.replace('TMDB_', '');
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    updateSetting('TMDB', propId, value);
  });

  const handleIncludeRestrictedChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setNewSettings(produce(newSettings, (draftState) => {
      draftState.WebUI_Settings.collection.tmdb.includeRestricted = value;
    }));
  });

  return (
    <>
      <Checkbox
        justify
        label="Auto Link"
        id="TMDB_AutoLink"
        isChecked={AutoLink}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label="Auto Link Restricted"
        id="TMDB_AutoLinkRestricted"
        isChecked={AutoLinkRestricted}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label="Include Restricted in Search"
        id="include-restricted-tmdb"
        isChecked={includeRestricted}
        onChange={handleIncludeRestrictedChange}
      />
      <Checkbox
        justify
        label="Download Crew And Cast"
        id="TMDB_AutoDownloadCrewAndCast"
        isChecked={AutoDownloadCrewAndCast}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label="Download Movie Collections"
        id="TMDB_AutoDownloadCollections"
        isChecked={AutoDownloadCollections}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label="Download Alternate Ordering"
        id="TMDB_AutoDownloadAlternateOrdering"
        isChecked={AutoDownloadAlternateOrdering}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label="Download Backdrops"
        id="TMDB_AutoDownloadBackdrops"
        isChecked={AutoDownloadBackdrops}
        onChange={handleInputChange}
      />
      <div
        className={cx(
          'flex justify-between transition-opacity items-center',
          !AutoDownloadBackdrops && 'pointer-events-none opacity-65',
        )}
      >
        Max Backdrops
        <InputSmall
          id="TMDB_MaxAutoBackdrops"
          value={MaxAutoBackdrops}
          type="text"
          onChange={handleInputChange}
          className="w-12 px-3 py-1"
        />
      </div>
      <Checkbox
        justify
        label="Download Posters"
        id="TMDB_AutoDownloadPosters"
        isChecked={AutoDownloadPosters}
        onChange={handleInputChange}
      />
      <div
        className={cx(
          'flex justify-between transition-opacity items-center',
          !AutoDownloadPosters && 'pointer-events-none opacity-65',
        )}
      >
        Max Posters
        <InputSmall
          id="TMDB_MaxAutoPosters"
          value={MaxAutoPosters}
          type="text"
          onChange={handleInputChange}
          className="w-12 px-3 py-1"
        />
      </div>
      <Checkbox
        justify
        label="Download Logos"
        id="TMDB_AutoDownloadLogos"
        isChecked={AutoDownloadLogos}
        onChange={handleInputChange}
      />
      <div
        className={cx(
          'flex justify-between transition-opacity items-center',
          !AutoDownloadLogos && 'pointer-events-none opacity-65',
        )}
      >
        Max Logos
        <InputSmall
          id="TMDB_MaxAutoLogos"
          value={MaxAutoLogos}
          type="text"
          onChange={handleInputChange}
          className="w-12 px-3 py-1"
        />
      </div>
      <Checkbox
        justify
        label="Download Episode Thumbnails"
        id="TMDB_AutoDownloadThumbnails"
        isChecked={AutoDownloadThumbnails}
        onChange={handleInputChange}
      />
      <div
        className={cx(
          'flex justify-between transition-opacity items-center',
          !AutoDownloadThumbnails && 'pointer-events-none opacity-65',
        )}
      >
        Max Episode Thumbnails
        <InputSmall
          id="TMDB_MaxAutoThumbnails"
          value={MaxAutoThumbnails}
          type="text"
          onChange={handleInputChange}
          className="w-12 px-3 py-1"
        />
      </div>
      <Checkbox
        justify
        label="Download Staff Images"
        id="TMDB_AutoDownloadStaffImages"
        isChecked={AutoDownloadStaffImages}
        onChange={handleInputChange}
      />
      <div
        className={cx(
          'flex justify-between transition-opacity items-center',
          !AutoDownloadStaffImages && 'pointer-events-none opacity-65',
        )}
      >
        Max Staff Images
        <InputSmall
          id="TMDB_MaxAutoStaffImages"
          value={MaxAutoStaffImages}
          type="text"
          onChange={handleInputChange}
          className="w-12 px-3 py-1"
        />
      </div>
      <Checkbox
        justify
        label="Download Studio Images"
        id="TMDB_AutoDownloadStudioImages"
        isChecked={AutoDownloadStudioImages}
        onChange={handleInputChange}
      />
    </>
  );
});

export default TMDBSettings;
