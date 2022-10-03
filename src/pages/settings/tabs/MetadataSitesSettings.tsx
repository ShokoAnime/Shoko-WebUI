import React from 'react';

import { useSettingsContext } from '../SettingsPage';

import ShokoPanel from '../../../components/Panels/ShokoPanel';
import Checkbox from '../../../components/Input/Checkbox';
import InputSmall from '../../../components/Input/InputSmall';
import cx from 'classnames';
import SelectSmall from '../../../components/Input/SelectSmall';

const tvdbLanguages = [
  ['en', 'English'],
  ['sv', 'Swedish'],
  ['no', 'Norwegian'],
  ['da', 'Danish'],
  ['fi', 'Finnish'],
  ['nl', 'Dutch'],
  ['de', 'German'],
  ['it', 'Italian'],
  ['es', 'Spanish'],
  ['fr', 'French'],
  ['pl', 'Polish'],
  ['hu', 'Hungarian'],
  ['el', 'Greek'],
  ['tr', 'Turkish'],
  ['ru', 'Russian'],
  ['he', 'Hebrew'],
  ['ja', 'Japanese'],
  ['pt', 'Portuguese'],
  ['cs', 'Czech'],
  ['sl', 'Slovenian'],
  ['hr', 'Croatian'],
  ['ko', 'Korean'],
  ['zh', 'Chinese'],
];

function MetadataSitesSettings() {
  const {
    fetching, newSettings, updateSetting,
  } = useSettingsContext();


  const { MovieDb, TvDB } = newSettings;

  return (
    <>
      <ShokoPanel title="MovieDB Options" isFetching={fetching}>
        <Checkbox justify label="Download Fanart" id="download-tmdb-fanart" isChecked={MovieDb.AutoFanart} onChange={event => updateSetting('MovieDb', 'AutoFanart', event.target.checked)} />
        <div className={cx('flex justify-between mt-2 transition-opacity', !MovieDb.AutoFanart && 'pointer-events-none opacity-50')}>
          Max Fanart
          <InputSmall id="max-tmdb-fanart" value={MovieDb.AutoFanartAmount} type="text" onChange={event => updateSetting('MovieDb', 'AutoFanartAmount', event.target.value)} className="w-10 px-2 py-0.5" />
        </div>
        <Checkbox justify label="Download Posters" id="download-tmdb-posters" isChecked={MovieDb.AutoPosters} onChange={event => updateSetting('MovieDb', 'AutoPosters', event.target.checked)} className="mt-2" />
        <div className={cx('flex justify-between mt-2 transition-opacity', !MovieDb.AutoPosters && 'pointer-events-none opacity-50')}>
          Max Posters
          <InputSmall id="max-tmdb-posters" value={MovieDb.AutoPostersAmount} type="text" onChange={event => updateSetting('MovieDb', 'AutoPostersAmount', event.target.value)} className="w-10 px-2 py-0.5" />
        </div>
      </ShokoPanel>

      <ShokoPanel title="TVDB Options" isFetching={fetching} className="mt-8">
        <Checkbox justify label="Auto Link" id="autolink-tvdb" isChecked={TvDB.AutoLink} onChange={event => updateSetting('TvDB', 'AutoLink', event.target.checked)} />
        <div className="flex justify-between items-center mt-2">
          <span>Language</span>
          <SelectSmall id="tvdb-language" value={TvDB.Language} onChange={event => updateSetting('TvDB', 'Language', event.target.value)}>
            {tvdbLanguages.map(
              item => (<option value={item[0]} key={item[0]}>{item[1]}</option>),
            )}
          </SelectSmall>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span>Automatically Update Stats</span>
          <SelectSmall id="update-tvdb-stats" value={TvDB.UpdateFrequency} onChange={event => updateSetting('TvDB', 'UpdateFrequency', event.target.value)}>
            <option value={1}>Never</option>
            <option value={2}>Every 6 Hours</option>
            <option value={3}>Every 12 Hours</option>
            <option value={4}>Every 24 Hours</option>
            <option value={5}>Once a Week</option>
            <option value={6}>Once a Month</option>
          </SelectSmall>
        </div>
        <Checkbox justify label="Download Fanart" id="download-tvdb-fanart" isChecked={TvDB.AutoFanart} onChange={event => updateSetting('TvDB', 'AutoFanart', event.target.checked)} className="mt-2" />
        <div className={cx('flex justify-between mt-2 transition-opacity', !TvDB.AutoFanart && 'pointer-events-none opacity-50')}>
          Max Fanart
          <InputSmall id="max-tvdb-fanart" value={TvDB.AutoFanartAmount} type="text" onChange={event => updateSetting('TvDB', 'AutoFanartAmount', event.target.value)} className="w-10 px-2 py-0.5" />
        </div>
        <Checkbox justify label="Download Posters" id="download-tvdb-posters" isChecked={TvDB.AutoPosters} onChange={event => updateSetting('TvDB', 'AutoPosters', event.target.checked)} className="mt-2" />
        <div className={cx('flex justify-between mt-2 transition-opacity', !TvDB.AutoPosters && 'pointer-events-none opacity-50')}>
          Max Posters
          <InputSmall id="max-tvdb-posters" value={TvDB.AutoPostersAmount} type="text" onChange={event => updateSetting('TvDB', 'AutoPostersAmount', event.target.value)} className="w-10 px-2 py-0.5" />
        </div>
        <Checkbox justify label="Download Wide Banners" id="download-tvdb-banners" isChecked={TvDB.AutoWideBanners} onChange={event => updateSetting('TvDB', 'AutoWideBanners', event.target.checked)} className="mt-2" />
        <div className={cx('flex justify-between mt-2 transition-opacity', !TvDB.AutoWideBanners && 'pointer-events-none opacity-50')}>
          Max Wide Banners
          <InputSmall id="max-tvdb-baners" value={TvDB.AutoWideBannersAmount} type="text" onChange={event => updateSetting('TvDB', 'AutoWideBannersAmount', event.target.value)} className="w-10 px-2 py-0.5" />
        </div>
      </ShokoPanel>
    </>
  );
}

export default MetadataSitesSettings;
