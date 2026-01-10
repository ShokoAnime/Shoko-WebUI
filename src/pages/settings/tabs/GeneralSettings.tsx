/* eslint-disable @typescript-eslint/naming-convention */
import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { mdiBrushOutline, mdiOpenInNew, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import SelectSmall from '@/components/Input/SelectSmall';
import toast from '@/components/Toast';
import { useVersionQuery } from '@/core/react-query/init/queries';
import { useWebuiUploadThemeMutation } from '@/core/react-query/webui/mutations';
import { useWebuiThemesQuery, useWebuiUpdateCheckQuery } from '@/core/react-query/webui/queries';
import { uiVersion } from '@/core/util';
import useSettingsContext from '@/hooks/useSettingsContext';

let themeUpdateCounter = 0;

const UI_VERSION = uiVersion();

const GeneralSettings = () => {
  const { t } = useTranslation('settings');
  const { newSettings, setNewSettings, updateSetting } = useSettingsContext();

  const {
    LogRotator,
    TraceLog,
    WebUI_Settings,
  } = newSettings;

  const checkWebuiUpdateQuery = useWebuiUpdateCheckQuery(
    { channel: newSettings.WebUI_Settings.updateChannel, force: true },
    false,
  );
  const themePathHref = useMemo(() => document.getElementById('theme-css')!.attributes.getNamedItem('href')!, []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const versionQuery = useVersionQuery();
  const themesQuery = useWebuiThemesQuery();
  const { isPending: isUploading, mutate: uploadTheme } = useWebuiUploadThemeMutation();

  const onOpenFileDialog = (event: React.SyntheticEvent) => {
    if (isUploading) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const file = event.target.files?.[0];
    if (!file) return;
    uploadTheme({ file }, {
      onSuccess(data) {
        themesQuery.refetch()
          .then(() => {
            themeUpdateCounter += 1;
            // URL cannot be built without a base, so we use localhost
            const path = new URL(themePathHref.value, 'http://localhost');
            path.searchParams.set('general.updateCount', themeUpdateCounter.toString());
            // Remove base from URL and set value
            themePathHref.value = `${path.pathname}${path.search}`;

            updateSetting('WebUI_Settings', 'theme', `theme-${data.ID}`);
            toast.info(t('general.theme.uploadSuccess', { name: data.Name }));
          })
          .catch(console.error);
      },
    });
  };

  const currentTheme = useMemo(() => (
    themesQuery.data?.find(theme => `theme-${theme.ID}` === WebUI_Settings.theme)
  ), [themesQuery.data, WebUI_Settings.theme]);

  return (
    <>
      <title>{t('general.pageTitle')}</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">
          {t('general.title')}
        </div>
        <div>
          {t('general.description')}
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center justify-between">
          <div className="font-semibold">
            {t('general.version.title')}
          </div>
          <Button
            buttonType="primary"
            buttonSize="small"
            className="flex flex-row flex-wrap items-center gap-x-2"
            onClick={() => {
              checkWebuiUpdateQuery.refetch().then(() => {}, () => {});
            }}
            tooltip={t('general.version.checkUpdate')}
          >
            <Icon
              path={mdiRefresh}
              size={0.85}
              spin={checkWebuiUpdateQuery.isFetching}
            />
            <span>{t('general.version.refresh')}</span>
          </Button>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="flex h-8 justify-between">
            <span>{t('general.version.serverVersion')}</span>
            <div className="flex gap-2">
              {versionQuery.data?.Server.Version}
              <a
                className="flex gap-2 text-panel-text-primary"
                target="_blank"
                href={`https://github.com/ShokoAnime/ShokoServer/compare/${
                  versionQuery.data?.Server.Commit?.slice(0, 7)
                }...master`}
                rel="noreferrer"
              >
                {`(${versionQuery.data?.Server.Commit?.slice(0, 7)})`}
                <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
              </a>
            </div>
          </div>
          <div className="flex h-8 justify-between">
            <span>{t('general.version.serverChannel')}</span>
            {versionQuery.data?.Server.ReleaseChannel}
          </div>
          <div className="flex h-8 justify-between">
            <span>{t('general.version.webuiVersion')}</span>
            <div className="flex gap-2">
              {versionQuery.data?.WebUI?.Version}
              <a
                className="flex gap-x-2 text-panel-text-primary"
                target="_blank"
                href={`https://github.com/ShokoAnime/Shoko-WebUI/compare/${UI_VERSION}...master`}
                rel="noreferrer"
              >
                {`(${UI_VERSION})`}
                <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between ">
            <span>{t('general.version.webuiChannel')}</span>
            <SelectSmall
              id="update-channel"
              value={WebUI_Settings.updateChannel}
              onChange={event => updateSetting('WebUI_Settings', 'updateChannel', event.target.value)}
            >
              <option value="Stable">Stable</option>
              <option value="Dev">Dev</option>
            </SelectSmall>
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center justify-between">
          <div className="font-semibold">
            {t('general.theme.title')}
          </div>
          <input
            ref={fileInputRef}
            className="hidden"
            multiple
            id="file-input-field"
            name="file"
            type="file"
            onChange={onFileChange}
          />
          <Button
            buttonType="secondary"
            buttonSize="small"
            className="flex flex-row flex-wrap items-center gap-x-2"
            onClick={onOpenFileDialog}
            disabled={isUploading}
            tooltip={t('general.theme.uploadTooltip')}
          >
            <Icon
              path={mdiBrushOutline}
              size={0.85}
            />
            <span>{t('general.theme.upload')}</span>
          </Button>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            {t('general.theme.theme')}
            <SelectSmall
              id="theme"
              value={WebUI_Settings.theme}
              onChange={event => updateSetting('WebUI_Settings', 'theme', event.target.value)}
            >
              <option value="theme-shoko-gray" key="shoko-gray">Shoko Gray (Default)</option>
              {themesQuery.data?.map(theme => <option value={`theme-${theme.ID}`} key={theme.ID}>{theme.Name}</option>)}
            </SelectSmall>
          </div>
          <div className="flex h-8 items-center justify-between">
            <span>{t('general.theme.description')}</span>
            <span className="max-w-xs truncate">
              {currentTheme?.Description ?? t('general.theme.defaultDescription')}
            </span>
          </div>
          <div className="flex h-8 items-center justify-between">
            <span>{t('general.theme.version')}</span>
            {currentTheme?.Version ?? '1.0.0'}
          </div>
          <div className="flex h-8 items-center justify-between">
            <span>{t('general.theme.author')}</span>
            {currentTheme?.Author ?? t('general.theme.defaultAuthor')}
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex justify-between">
          <div className="flex items-center font-semibold">
            {t('general.notifications.title')}
          </div>
          <Checkbox
            label={t('general.notifications.enable')}
            id="enable-notifications"
            isChecked={WebUI_Settings?.notifications ?? true}
            onChange={event => updateSetting('WebUI_Settings', 'notifications', event.target.checked)}
          />
        </div>
        <div
          className={cx(
            'flex justify-between items-center transition-opacity',
            !(WebUI_Settings?.notifications ?? true) && 'pointer-events-none opacity-65',
          )}
        >
          <span>{t('general.notifications.position')}</span>
          <SelectSmall
            id="toast-position"
            value={WebUI_Settings.toastPosition}
            onChange={event => updateSetting('WebUI_Settings', 'toastPosition', event.target.value)}
          >
            <option value="bottom-right">{t('general.notifications.bottomRight')}</option>
            <option value="top-right">{t('general.notifications.topRight')}</option>
          </SelectSmall>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex justify-between">
          <div className="flex items-center font-semibold">{t('general.logs.title')}</div>
          <Checkbox
            id="enable-logs"
            label={t('general.notifications.enable')}
            isChecked={LogRotator.Enabled}
            onChange={event => updateSetting('LogRotator', 'Enabled', event.target.checked)}
          />
        </div>
        <div
          className={cx(
            'flex flex-col transition-opacity gap-y-2',
            !LogRotator.Enabled && 'pointer-events-none opacity-65',
          )}
        >
          <Checkbox
            justify
            label={t('general.logs.compress')}
            id="compress-logs"
            isChecked={LogRotator.Zip}
            onChange={event => updateSetting('LogRotator', 'Zip', event.target.checked)}
          />
          <Checkbox
            justify
            label={t('general.logs.delete')}
            id="delete-logs"
            isChecked={LogRotator.Delete}
            onChange={event => updateSetting('LogRotator', 'Delete', event.target.checked)}
          />
          <div
            className={cx(
              'flex justify-between items-center transition-opacity',
              !LogRotator.Delete && 'pointer-events-none opacity-65',
            )}
          >
            <span>{t('general.logs.deleteFrequency')}</span>
            <SelectSmall
              id="delete-frequency"
              value={LogRotator.Delete_Days}
              onChange={event => updateSetting('LogRotator', 'Delete_Days', event.target.value)}
            >
              <option value="0">{t('general.logs.never')}</option>
              <option value="7">{t('general.logs.daily')}</option>
              <option value="30">{t('general.logs.monthly')}</option>
              <option value="90">{t('general.logs.quarterly')}</option>
            </SelectSmall>
          </div>
          <Checkbox
            justify
            label={t('general.logs.trace')}
            id="trace-logs"
            isChecked={TraceLog}
            onChange={event => setNewSettings({ ...newSettings, TraceLog: event.target.checked })}
          />
        </div>
      </div>
      <div className="border-b border-panel-border" />
    </>
  );
};

export default GeneralSettings;
