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

  const { MovieDb, TvDB } = newSettings;

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
            label="Download Fanart"
            id="download-tmdb-fanart"
            isChecked={MovieDb.AutoFanart}
            onChange={event => updateSetting('MovieDb', 'AutoFanart', event.target.checked)}
          />
          <div
            className={cx(
              'flex justify-between transition-opacity items-center',
              !MovieDb.AutoFanart && 'pointer-events-none opacity-65',
            )}
          >
            Max Fanart
            <InputSmall
              id="max-tmdb-fanart"
              value={MovieDb.AutoFanartAmount}
              type="text"
              onChange={event => updateSetting('MovieDb', 'AutoFanartAmount', event.target.value)}
              className="w-12 px-3 py-1"
            />
          </div>
          <Checkbox
            justify
            label="Download Posters"
            id="download-tmdb-posters"
            isChecked={MovieDb.AutoPosters}
            onChange={event => updateSetting('MovieDb', 'AutoPosters', event.target.checked)}
          />
          <div
            className={cx(
              'flex justify-between transition-opacity items-center',
              !MovieDb.AutoPosters && 'pointer-events-none opacity-65',
            )}
          >
            Max Posters
            <InputSmall
              id="max-tmdb-posters"
              value={MovieDb.AutoPostersAmount}
              type="text"
              onChange={event => updateSetting('MovieDb', 'AutoPostersAmount', event.target.value)}
              className="w-12 px-3 py-1"
            />
          </div>
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
            label="Download Fanart"
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
            Max Fanart
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
