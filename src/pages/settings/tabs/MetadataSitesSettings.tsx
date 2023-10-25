import React from 'react';
import cx from 'classnames';
import { toNumber } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import toast from '@/components/Toast';
import { useLazyGetTraktCodeQuery } from '@/core/rtkQuery/splitApi/traktApi';
import { dayjs } from '@/core/util';
import { useSettingsContext } from '@/pages/settings/SettingsPage';

export const tvdbLanguages = [
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
  const { newSettings, updateSetting } = useSettingsContext();

  const { MovieDb, TraktTv, TvDB } = newSettings;

  const [traktCodeTrigger, traktCodeResult] = useLazyGetTraktCodeQuery();

  return (
    <>
      <div className="text-xl font-semibold">Metadata Sites</div>
      <div className="mt-0.5 flex flex-col gap-y-4">
        <div className="font-semibold">MovieDB Options</div>
        <div className="flex flex-col gap-y-2 border-b border-panel-border pb-8">
          <Checkbox
            justify
            label="Download Fanart"
            id="download-tmdb-fanart"
            isChecked={MovieDb.AutoFanart}
            onChange={event => updateSetting('MovieDb', 'AutoFanart', event.target.checked)}
          />
          <div
            className={cx(
              'flex justify-between transition-opacity',
              !MovieDb.AutoFanart && 'pointer-events-none opacity-50',
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
              'flex justify-between transition-opacity',
              !MovieDb.AutoPosters && 'pointer-events-none opacity-50',
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

      <div className="flex flex-col gap-y-4">
        <div className="font-semibold">TVDB Options</div>
        <div className="flex flex-col gap-y-2 border-b border-panel-border pb-8">
          <Checkbox
            justify
            label="Auto Link"
            id="autolink-tvdb"
            isChecked={TvDB.AutoLink}
            onChange={event => updateSetting('TvDB', 'AutoLink', event.target.checked)}
          />
          <div className="flex items-center justify-between">
            <span>Language</span>
            <SelectSmall
              id="tvdb-language"
              value={TvDB.Language}
              onChange={event => updateSetting('TvDB', 'Language', event.target.value)}
            >
              {tvdbLanguages.map(
                item => <option value={item[0]} key={item[0]}>{item[1]}</option>,
              )}
            </SelectSmall>
          </div>
          <div className="flex items-center justify-between">
            <span>Automatically Update Stats</span>
            <SelectSmall
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
          </div>
          <Checkbox
            justify
            label="Download Fanart"
            id="download-tvdb-fanart"
            isChecked={TvDB.AutoFanart}
            onChange={event => updateSetting('TvDB', 'AutoFanart', event.target.checked)}
          />
          <div
            className={cx(
              'flex justify-between transition-opacity',
              !TvDB.AutoFanart && 'pointer-events-none opacity-50',
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
              'flex justify-between transition-opacity',
              !TvDB.AutoPosters && 'pointer-events-none opacity-50',
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
              'flex justify-between transition-opacity',
              !TvDB.AutoWideBanners && 'pointer-events-none opacity-50',
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

      <div className="flex flex-col gap-y-4">
        <div className="font-semibold">Trakt Options</div>
        <div className="flex flex-col gap-y-2 border-b border-panel-border pb-8">
          <Checkbox
            justify
            label="Enabled"
            id="trakt-enabled"
            isChecked={TraktTv.Enabled}
            onChange={event => updateSetting('TraktTv', 'Enabled', event.target.checked)}
          />
          {TraktTv.TokenExpirationDate === '' && traktCodeResult?.data?.usercode && (
            <div
              className={cx(
                'flex justify-between items-center mt',
                !TraktTv.Enabled && 'pointer-events-none opacity-50',
              )}
            >
              <div className="flex">
                Trakt Code:
                <span className="ml-1 font-bold">{traktCodeResult?.data?.usercode}</span>
              </div>
              <a
                href={traktCodeResult?.data?.url}
                rel="noopener noreferrer"
                target="_blank"
                className="text-panel-text-important hover:underline"
              >
                Click here to activate
              </a>
            </div>
          )}
          {TraktTv.TokenExpirationDate === '' && !traktCodeResult?.data?.usercode && (
            <div
              className={cx('flex justify-between items-center', !TraktTv.Enabled && 'pointer-events-none opacity-50')}
            >
              Trakt Code
              <Button
                onClick={() =>
                  traktCodeTrigger().then(() =>
                    toast.info(
                      'You have approximately 10 minutes to visit the URL provided and enter the code, refresh the page after activation is complete.',
                      undefined,
                      { autoClose: 10000 },
                    ), () => {})}
                className="bg-panel-text-primary px-2 py-1 font-semibold "
              >
                {traktCodeResult.isFetching ? 'Requesting...' : 'Get Code'}
              </Button>
            </div>
          )}
          {TraktTv.TokenExpirationDate !== '' && (
            <div className={cx(!TraktTv.Enabled && 'pointer-events-none opacity-50', 'gap-y-2')}>
              <div className="flex justify-between">
                <span>Token valid until</span>
                {dayjs.unix(toNumber(TraktTv.TokenExpirationDate)).format('MMM Do YYYY, HH:mm')}
              </div>
              <div className="flex items-center justify-between">
                <span>Automatically Update Data</span>
                <SelectSmall
                  id="update-trakt-data"
                  value={TraktTv.UpdateFrequency}
                  onChange={event =>
                    updateSetting('TraktTv', 'UpdateFrequency', event.target.value)}
                >
                  <option value={1}>Never</option>
                  <option value={2}>Every 6 Hours</option>
                  <option value={3}>Every 12 Hours</option>
                  <option value={4}>Every 24 Hours</option>
                  <option value={5}>Once a Week</option>
                  <option value={6}>Once a Month</option>
                </SelectSmall>
              </div>
              <div className="flex items-center justify-between">
                <span>Sync Frequency</span>
                <SelectSmall
                  id="sync-trakt-data"
                  value={TraktTv.SyncFrequency}
                  onChange={event => updateSetting('TraktTv', 'SyncFrequency', event.target.value)}
                >
                  <option value={1}>Never</option>
                  <option value={2}>Every 6 Hours</option>
                  <option value={3}>Every 12 Hours</option>
                  <option value={4}>Every 24 Hours</option>
                  <option value={5}>Once a Week</option>
                  <option value={6}>Once a Month</option>
                </SelectSmall>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MetadataSitesSettings;
