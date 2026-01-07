import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('settings');
  const { newSettings, updateSetting } = useSettingsContext();
  const { TraktTv } = newSettings;

  const settings = useSettingsQuery().data;
  const traktQuery = useTraktCodeQuery(false);
  const { mutate: patchSettings } = usePatchSettingsMutation();

  const handleGetCode = useEventCallback(() => {
    traktQuery.refetch().then(
      () => {
        toast.info(
          t('trakt.activationInstructions'),
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

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = useEventCallback(
    (event) => {
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      updateSetting('TraktTv', event.target.id, value);
    },
  );

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center justify-between font-semibold">
        {t('trakt.title')}
        {TraktTv.TokenExpirationDate !== '' && (
          <Button
            onClick={handleTraktClear}
            className="px-4 py-1"
            buttonType="danger"
          >
            {t('trakt.unlink')}
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-y-1">
        <Checkbox
          justify
          label={t('trakt.enabled')}
          id="Enabled"
          isChecked={TraktTv.Enabled}
          onChange={handleInputChange}
        />
        {TraktTv.TokenExpirationDate === '' && traktQuery.data?.usercode && (
          <div
            className={cx(
              'flex h-8 justify-between items-center',
              !TraktTv.Enabled && 'pointer-events-none opacity-65',
            )}
          >
            <Button className="flex cursor-pointer" onClick={handleCopy}>
              {t('trakt.codeLabel')}
              :
              <span className="ml-1 font-bold">{traktQuery.data?.usercode}</span>
            </Button>
            <a
              href={traktQuery.data?.url}
              rel="noopener noreferrer"
              target="_blank"
              className="text-panel-text-important hover:underline"
            >
              {t('trakt.activate')}
            </a>
          </div>
        )}
        {TraktTv.TokenExpirationDate === '' && !traktQuery.data?.usercode && (
          <div
            className={cx(
              'flex justify-between items-center',
              !TraktTv.Enabled && 'pointer-events-none opacity-65',
            )}
          >
            {t('trakt.codeLabel')}
            <Button
              onClick={handleGetCode}
              buttonType="primary"
              buttonSize="small"
              className="py-1.5 text-xs"
            >
              {traktQuery.isFetching ? t('trakt.requesting') : t('trakt.getCode')}
            </Button>
          </div>
        )}
        {TraktTv.TokenExpirationDate !== '' && (
          <div className={cx(!TraktTv.Enabled && 'pointer-events-none opacity-65', 'flex flex-col gap-y-1')}>
            <div className="flex h-8 items-center justify-between">
              <span>{t('trakt.tokenValidUntil')}</span>
              {dayjs.unix(toNumber(TraktTv.TokenExpirationDate)).format('MMM Do YYYY, HH:mm')}
            </div>
            <Checkbox
              justify
              label={t('trakt.autoLink')}
              id="AutoLink"
              isChecked={TraktTv.AutoLink}
              onChange={handleInputChange}
            />
            <div className="flex items-center justify-between">
              <span>{t('trakt.updateData')}</span>
              <SelectSmall
                id="UpdateFrequency"
                value={TraktTv.UpdateFrequency}
                onChange={handleInputChange}
              >
                <option value={1}>{t('frequency.never')}</option>
                <option value={2}>{t('frequency.6hours')}</option>
                <option value={3}>{t('frequency.12hours')}</option>
                <option value={4}>{t('frequency.24hours')}</option>
                <option value={5}>{t('frequency.week')}</option>
                <option value={6}>{t('frequency.month')}</option>
              </SelectSmall>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('trakt.syncFrequency')}</span>
              <SelectSmall
                id="SyncFrequency"
                value={TraktTv.SyncFrequency}
                onChange={handleInputChange}
              >
                <option value={1}>{t('frequency.never')}</option>
                <option value={2}>{t('frequency.6hours')}</option>
                <option value={3}>{t('frequency.12hours')}</option>
                <option value={4}>{t('frequency.24hours')}</option>
                <option value={5}>{t('frequency.week')}</option>
                <option value={6}>{t('frequency.month')}</option>
              </SelectSmall>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TraktSettings;
