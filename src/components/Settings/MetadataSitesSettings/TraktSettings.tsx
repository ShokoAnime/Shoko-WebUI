import React, { useEffect } from 'react';
import cx from 'classnames';
import { toNumber } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import SelectSmall from '@/components/Input/SelectSmall';
import toast from '@/components/Toast';
import queryClient from '@/core/react-query/queryClient';
import { initialSettings } from '@/core/react-query/settings/helpers';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { useTraktCodeQuery } from '@/core/react-query/trakt/queries';
import { copyToClipboard, dayjs } from '@/core/util';
import useEventCallback from '@/hooks/useEventCallback';
import useSettingsContext from '@/hooks/useSettingsContext';

const TraktSettings = () => {
  const { newSettings, updateSetting } = useSettingsContext();
  const { TraktTv } = newSettings;

  const settings = useSettingsQuery().data;
  const traktQuery = useTraktCodeQuery(false);
  const { mutate: patchSettings } = usePatchSettingsMutation();

  const handleGetCode = useEventCallback(() => {
    traktQuery.refetch().then(
      () => {
        toast.info(
          'Click on the code to copy it. You have approximately 10 minutes to visit the URL provided and enter the code. SAVE YOUR SETTINGS after activation is complete.',
          undefined,
          { autoClose: 600000, toastId: 'trakt-code', position: 'top-right' },
        );

        setTimeout(() => {
          queryClient
            .resetQueries({ queryKey: ['trakt-code'] })
            .catch(console.error);
        }, 600000);
      },
    ).catch(console.error);
  });

  const handleTraktClear = useEventCallback(
    () => patchSettings({ newSettings: { ...settings, TraktTv: initialSettings.TraktTv } }),
  );

  const handleCopy = useEventCallback(() => {
    if (!traktQuery.data?.usercode) return;
    copyToClipboard(traktQuery.data.usercode, 'Trakt Code').catch(console.error);
  });

  useEffect(() => {
    if (TraktTv.TokenExpirationDate === '') return;
    if (!traktQuery.data?.usercode) return;
    queryClient.resetQueries({ queryKey: ['trakt-code'] }).catch(console.error);
  }, [TraktTv.TokenExpirationDate, traktQuery.data?.usercode]);

  useEffect(() => {
    if (TraktTv.TokenExpirationDate) toast.dismiss('trakt-code');
  }, [TraktTv.TokenExpirationDate]);

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center font-semibold">Trakt Options</div>
      <div className="flex flex-col gap-y-2">
        <Checkbox
          justify
          label="Enabled"
          id="trakt-enabled"
          isChecked={TraktTv.Enabled}
          onChange={event => updateSetting('TraktTv', 'Enabled', event.target.checked)}
        />
        {TraktTv.TokenExpirationDate === '' && traktQuery.data?.usercode && (
          <div
            className={cx(
              'flex justify-between items-center mt',
              !TraktTv.Enabled && 'pointer-events-none opacity-65',
            )}
          >
            <Button className="flex cursor-pointer" onClick={handleCopy}>
              Trakt Code:
              <span className="ml-1 font-bold">{traktQuery.data?.usercode}</span>
            </Button>
            <a
              href={traktQuery.data?.url}
              rel="noopener noreferrer"
              target="_blank"
              className="text-panel-text-important hover:underline"
            >
              Click here to activate
            </a>
          </div>
        )}
        {TraktTv.TokenExpirationDate === '' && !traktQuery.data?.usercode && (
          <div
            className={cx(
              'flex h-8 justify-between items-center',
              !TraktTv.Enabled && 'pointer-events-none opacity-65',
            )}
          >
            Trakt Code
            <Button
              onClick={handleGetCode}
              buttonType="primary"
              buttonSize="small"
            >
              {traktQuery.isFetching ? 'Requesting...' : 'Get Code'}
            </Button>
          </div>
        )}
        {TraktTv.TokenExpirationDate !== '' && (
          <>
            <div className={cx(!TraktTv.Enabled && 'pointer-events-none opacity-65', 'flex flex-col gap-y-2')}>
              <div className="flex h-8 justify-between">
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
                className="px-4 py-1.5 text-xs font-semibold"
                buttonType="danger"
              >
                Clear
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TraktSettings;
