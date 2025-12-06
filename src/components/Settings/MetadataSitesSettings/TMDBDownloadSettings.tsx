import React from 'react';
import cx from 'classnames';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';

import type { SettingsContextType } from '@/core/types/context';

type Props = Omit<SettingsContextType, 'setNewSettings'>;

const TMDBDownloadSettings = React.memo((props: Props) => {
  const { newSettings, updateSetting } = props;

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
    MaxAutoBackdrops,
    MaxAutoLogos,
    MaxAutoPosters,
    MaxAutoStaffImages,
    MaxAutoThumbnails,
  } = newSettings.TMDB;

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const propId = event.target.id.replace('TMDB_', '');
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    updateSetting('TMDB', propId, value);
  };

  return (
    <>
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
          type="number"
          max={30}
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
          type="number"
          max={30}
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
          type="number"
          max={30}
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
          type="number"
          max={30}
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
          type="number"
          max={30}
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

export default TMDBDownloadSettings;
