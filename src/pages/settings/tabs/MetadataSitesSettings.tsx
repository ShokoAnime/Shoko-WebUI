import React from 'react';
import cx from 'classnames';
import { toNumber } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import TvdbLanguageSelect from '@/components/Settings/TvdbLanguageSelect';
import toast from '@/components/Toast';
import queryClient from '@/core/react-query/queryClient';
import { initialSettings } from '@/core/react-query/settings/helpers';
import { useTraktCodeQuery } from '@/core/react-query/trakt/queries';
import { dayjs } from '@/core/util';
import useEventCallback from '@/hooks/useEventCallback';
import { useSettingsContext } from '@/pages/settings/SettingsPage';

const TraktSettings = () => {
  const { newSettings, setNewSettings, updateSetting } = useSettingsContext();
  const { TraktTv } = newSettings;

  const traktQuery = useTraktCodeQuery(false);

  const handleGetCode = useEventCallback(() => {
    traktQuery.refetch().then(
      () => {
        toast.info(
          'You have approximately 10 minutes to visit the URL provided and enter the code. SAVE YOUR SETTINGS after activation is complete.',
          undefined,
          { autoClose: 10000 },
        );

        setTimeout(() => {
          queryClient
            .resetQueries({ queryKey: ['trakt-code'] })
            .catch(console.error);
        }, 600000);
      },
    ).catch(console.error);
  });

  const handleTraktClear = useEventCallback(() => setNewSettings({ ...newSettings, TraktTv: initialSettings.TraktTv }));

  return (
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
        {TraktTv.TokenExpirationDate === '' && traktQuery?.data?.usercode && (
          <div
            className={cx(
              'flex justify-between items-center mt',
              !TraktTv.Enabled && 'pointer-events-none opacity-50',
            )}
          >
            <div className="flex">
              Trakt Code:
              <span className="ml-1 font-bold">{traktQuery?.data?.usercode}</span>
            </div>
            <a
              href={traktQuery?.data?.url}
              rel="noopener noreferrer"
              target="_blank"
              className="text-panel-text-important hover:underline"
            >
              Click here to activate
            </a>
          </div>
        )}
        {TraktTv.TokenExpirationDate === '' && !traktQuery?.data?.usercode && (
          <div
            className={cx('flex justify-between items-center', !TraktTv.Enabled && 'pointer-events-none opacity-50')}
          >
            Trakt Code
            <Button
              onClick={handleGetCode}
              className="px-4"
              buttonType="primary"
            >
              {traktQuery.isFetching ? 'Requesting...' : 'Get Code'}
            </Button>
          </div>
        )}
        {TraktTv.TokenExpirationDate !== '' && (
          <div className="flex flex-col gap-y-2">
            <div className={cx(!TraktTv.Enabled && 'pointer-events-none opacity-50', 'flex flex-col gap-y-2')}>
              <div className="flex justify-between">
                <span>Token valid until</span>
                {dayjs.unix(toNumber(TraktTv.TokenExpirationDate)).format('MMM Do YYYY, HH:mm')}
              </div>
              <div className="flex items-center justify-between">
                <span>Automatically Update Data</span>
                <SelectSmall
                  id="update-trakt-data"
                  value={TraktTv.UpdateFrequency}
                  onChange={event => updateSetting('TraktTv', 'UpdateFrequency', event.target.value)}
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
            <div className="flex items-center justify-between">
              Trakt Token
              <Button
                onClick={handleTraktClear}
                className="px-4"
                buttonType="danger"
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function MetadataSitesSettings() {
  const { newSettings, updateSetting } = useSettingsContext();

  const { MovieDb, TvDB } = newSettings;

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
            <TvdbLanguageSelect
              id="tvdb-language"
              value={TvDB.Language}
              onChange={event => updateSetting('TvDB', 'Language', event.target.value)}
            />
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

      <TraktSettings />
    </>
  );
}

export default MetadataSitesSettings;
