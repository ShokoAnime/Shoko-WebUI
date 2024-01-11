import React from 'react';
import cx from 'classnames';
import { toNumber } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import SelectSmall from '@/components/Input/SelectSmall';
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
              buttonType="primary"
              className="h-8 min-w-24 text-xs font-semibold"
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
                className="h-8 w-16 text-xs font-semibold"
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

export default TraktSettings;
