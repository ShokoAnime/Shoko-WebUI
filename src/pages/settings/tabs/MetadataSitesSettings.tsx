import React from 'react';
import cx from 'classnames';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import PlexSettings from '@/components/Settings/MetadataSitesSettings/PlexSettings';
import TraktSettings from '@/components/Settings/MetadataSitesSettings/TraktSettings';
import TvdbLanguageSelect from '@/components/Settings/TvdbLanguageSelect';
import useSettingsContext from '@/hooks/useSettingsContext';

function MetadataSitesSettings() {
  const { newSettings, updateSetting } = useSettingsContext();

  const { TMDB, TvDB } = newSettings;

  return (
    <>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">Metadata Sites</div>
        <div>
          Customize the information and images that Shoko downloads for the series in your collection, and optionally
          link your Plex and/or Trakt account to your Shoko account.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex h-[2.149rem] items-center font-semibold">TMDB Options</div>
        <div className="flex flex-col gap-y-1">
          <Checkbox
            justify
            label="Auto Link"
            id="autolink-tmdb"
            isChecked={TMDB.AutoLink}
            onChange={event => updateSetting('TMDB', 'AutoLink', event.target.checked)}
          />
          <Checkbox
            justify
            label="Auto Link Restricted"
            id="auto-link-restricted-tmdb"
            isChecked={TMDB.AutoLinkRestricted}
            onChange={event => updateSetting('TMDB', 'AutoLinkRestricted', event.target.checked)}
          />
          <Checkbox
            justify
            label="Download All Titles"
            id="download-all-titles-tmdb"
            isChecked={TMDB.DownloadAllTitles}
            onChange={event => updateSetting('TMDB', 'DownloadAllTitles', event.target.checked)}
          />
          <Checkbox
            justify
            label="Download All Overviews"
            id="download-all-overviews-tmdb"
            isChecked={TMDB.DownloadAllOverviews}
            onChange={event => updateSetting('TMDB', 'DownloadAllOverviews', event.target.checked)}
          />
          <Checkbox
            justify
            label="Download Crew And Cast"
            id="crew-and-cast-tmdb"
            isChecked={TMDB.AutoDownloadCrewAndCast}
            onChange={event => updateSetting('TMDB', 'AutoDownloadCrewAndCast', event.target.checked)}
          />
          <Checkbox
            justify
            label="Download Movie Collections"
            id="movie-collections-tmdb"
            isChecked={TMDB.AutoDownloadCollections}
            onChange={event => updateSetting('TMDB', 'AutoDownloadCollections', event.target.checked)}
          />
          <Checkbox
            justify
            label="Download Alternate Ordering"
            id="alternate-ordering-tmdb"
            isChecked={TMDB.AutoDownloadAlternateOrdering}
            onChange={event => updateSetting('TMDB', 'AutoDownloadAlternateOrdering', event.target.checked)}
          />
          <Checkbox
            justify
            label="Download Backdrops"
            id="download-backdrops-tmdb"
            isChecked={TMDB.AutoDownloadBackdrops}
            onChange={event => updateSetting('TMDB', 'AutoDownloadBackdrops', event.target.checked)}
          />
          <div
            className={cx(
              'flex justify-between transition-opacity items-center',
              !TMDB.AutoDownloadBackdrops && 'pointer-events-none opacity-65',
            )}
          >
            Max Backdrops
            <InputSmall
              id="max-backdrops-tmdb"
              value={TMDB.MaxAutoBackdrops}
              type="text"
              onChange={event => updateSetting('TMDB', 'MaxAutoBackdrops', event.target.value)}
              className="w-12 px-3 py-1"
            />
          </div>
          <Checkbox
            justify
            label="Download Posters"
            id="download-posters-tmdb"
            isChecked={TMDB.AutoDownloadPosters}
            onChange={event => updateSetting('TMDB', 'AutoDownloadPosters', event.target.checked)}
          />
          <div
            className={cx(
              'flex justify-between transition-opacity items-center',
              !TMDB.AutoDownloadPosters && 'pointer-events-none opacity-65',
            )}
          >
            Max Posters
            <InputSmall
              id="max-posters-tmdb"
              value={TMDB.MaxAutoPosters}
              type="text"
              onChange={event => updateSetting('TMDB', 'MaxAutoPosters', event.target.value)}
              className="w-12 px-3 py-1"
            />
          </div>
          <Checkbox
            justify
            label="Download Logos"
            id="download-logos-tmdb"
            isChecked={TMDB.AutoDownloadLogos}
            onChange={event => updateSetting('TMDB', 'AutoDownloadLogos', event.target.checked)}
          />
          <div
            className={cx(
              'flex justify-between transition-opacity items-center',
              !TMDB.AutoDownloadLogos && 'pointer-events-none opacity-65',
            )}
          >
            Max Logos
            <InputSmall
              id="max-logos-tmdb"
              value={TMDB.MaxAutoLogos}
              type="text"
              onChange={event => updateSetting('TMDB', 'MaxAutoLogos', event.target.value)}
              className="w-12 px-3 py-1"
            />
          </div>
          <Checkbox
            justify
            label="Download Episode Thumbnails"
            id="download-thumbnails-tmdb"
            isChecked={TMDB.AutoDownloadThumbnails}
            onChange={event => updateSetting('TMDB', 'AutoDownloadThumbnails', event.target.checked)}
          />
          <div
            className={cx(
              'flex justify-between transition-opacity items-center',
              !TMDB.AutoDownloadThumbnails && 'pointer-events-none opacity-65',
            )}
          >
            Max Episode Thumbnails
            <InputSmall
              id="max-thumbnails-tmdb"
              value={TMDB.MaxAutoThumbnails}
              type="text"
              onChange={event => updateSetting('TMDB', 'MaxAutoThumbnails', event.target.value)}
              className="w-12 px-3 py-1"
            />
          </div>
          <Checkbox
            justify
            label="Download Staff Images"
            id="download-staff-tmdb"
            isChecked={TMDB.AutoDownloadStaffImages}
            onChange={event => updateSetting('TMDB', 'AutoDownloadStaffImages', event.target.checked)}
          />
          <div
            className={cx(
              'flex justify-between transition-opacity items-center',
              !TMDB.AutoDownloadStaffImages && 'pointer-events-none opacity-65',
            )}
          >
            Max Staff Images
            <InputSmall
              id="max-staff-tmdb"
              value={TMDB.MaxAutoStaffImages}
              type="text"
              onChange={event => updateSetting('TMDB', 'MaxAutoStaffImages', event.target.value)}
              className="w-12 px-3 py-1"
            />
          </div>
          <Checkbox
            justify
            label="Download Studio Images"
            id="download-studio-tmdb"
            isChecked={TMDB.AutoDownloadStudioImages}
            onChange={event => updateSetting('TMDB', 'AutoDownloadStudioImages', event.target.checked)}
          />
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex h-[2.149rem] items-center font-semibold">TVDB Options</div>
        <div className="flex flex-col gap-y-1">
          <Checkbox
            justify
            label="Auto Link"
            id="autolink-tvdb"
            isChecked={TvDB.AutoLink}
            onChange={event => updateSetting('TvDB', 'AutoLink', event.target.checked)}
          />
          <TvdbLanguageSelect
            label="Language"
            id="tvdb-language"
            value={TvDB.Language}
            onChange={event => updateSetting('TvDB', 'Language', event.target.value)}
          />
          <SelectSmall
            label="Automatically Update Stats"
            id="update-tvdb-stats"
            value={TvDB.UpdateFrequency}
            onChange={event => updateSetting('TvDB', 'UpdateFrequency', event.target.value)}
          >
            <option value={1}>Never</option>
            <option value={2}>Every 6 Hours</option>
            <option value={3}>Every 12 Hours</option>
            <option value={4}>Every 24 Hours</option>
            <option value={5}>Once a Week</option>
            <option value={6}>Once a Month</option>
          </SelectSmall>
          <Checkbox
            justify
            label="Download Backdrops"
            id="download-tvdb-fanart"
            isChecked={TvDB.AutoFanart}
            onChange={event => updateSetting('TvDB', 'AutoFanart', event.target.checked)}
          />
          <div
            className={cx(
              'flex justify-between transition-opacity items-center',
              !TvDB.AutoFanart && 'pointer-events-none opacity-65',
            )}
          >
            Max Backdrops
            <InputSmall
              id="max-tvdb-fanart"
              value={TvDB.AutoFanartAmount}
              type="text"
              onChange={event => updateSetting('TvDB', 'AutoFanartAmount', event.target.value)}
              className="w-12 px-3 py-1"
            />
          </div>
          <Checkbox
            justify
            label="Download Posters"
            id="download-tvdb-posters"
            isChecked={TvDB.AutoPosters}
            onChange={event => updateSetting('TvDB', 'AutoPosters', event.target.checked)}
          />
          <div
            className={cx(
              'flex justify-between transition-opacity items-center',
              !TvDB.AutoPosters && 'pointer-events-none opacity-65',
            )}
          >
            Max Posters
            <InputSmall
              id="max-tvdb-posters"
              value={TvDB.AutoPostersAmount}
              type="text"
              onChange={event => updateSetting('TvDB', 'AutoPostersAmount', event.target.value)}
              className="w-12 px-3 py-1"
            />
          </div>
          <Checkbox
            justify
            label="Download Wide Banners"
            id="download-tvdb-banners"
            isChecked={TvDB.AutoWideBanners}
            onChange={event => updateSetting('TvDB', 'AutoWideBanners', event.target.checked)}
          />
          <div
            className={cx(
              'flex justify-between transition-opacity items-center',
              !TvDB.AutoWideBanners && 'pointer-events-none opacity-65',
            )}
          >
            Max Wide Banners
            <InputSmall
              id="max-tvdb-banners"
              value={TvDB.AutoWideBannersAmount}
              type="text"
              onChange={event => updateSetting('TvDB', 'AutoWideBannersAmount', event.target.value)}
              className="w-12 px-3 py-1"
            />
          </div>
        </div>
      </div>
      <div className="border-b border-panel-border" />
      <TraktSettings />
      <div className="border-b border-panel-border" />
      <PlexSettings />
      <div className="border-b border-panel-border" />
    </>
  );
}

export default MetadataSitesSettings;
