import React from 'react';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';

import type { SettingsContextType } from '@/core/types/context';

type Props = Omit<SettingsContextType, 'setNewSettings'>;

const TMDBDownloadSettings = React.memo((props: Props) => {
  const { t } = useTranslation('settings');
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
        label={t('tmdb.downloadCrewAndCast')}
        id="TMDB_AutoDownloadCrewAndCast"
        isChecked={AutoDownloadCrewAndCast}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label={t('tmdb.downloadCollections')}
        id="TMDB_AutoDownloadCollections"
        isChecked={AutoDownloadCollections}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label={t('tmdb.downloadAlternateOrdering')}
        id="TMDB_AutoDownloadAlternateOrdering"
        isChecked={AutoDownloadAlternateOrdering}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label={t('tmdb.downloadBackdrops')}
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
        {t('tmdb.maxBackdrops')}
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
        label={t('tmdb.downloadPosters')}
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
        {t('tmdb.maxPosters')}
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
        label={t('tmdb.downloadLogos')}
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
        {t('tmdb.maxLogos')}
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
        label={t('tmdb.downloadThumbnails')}
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
        {t('tmdb.maxThumbnails')}
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
        label={t('tmdb.downloadStaffImages')}
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
        {t('tmdb.maxStaffImages')}
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
        label={t('tmdb.downloadStudioImages')}
        id="TMDB_AutoDownloadStudioImages"
        isChecked={AutoDownloadStudioImages}
        onChange={handleInputChange}
      />
    </>
  );
});

export default TMDBDownloadSettings;
