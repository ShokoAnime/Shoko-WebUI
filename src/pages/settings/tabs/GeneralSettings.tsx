/* eslint-disable @typescript-eslint/naming-convention */
import React, { useMemo, useRef } from 'react';
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
            path.searchParams.set('updateCount', themeUpdateCounter.toString());
            // Remove base from URL and set value
            themePathHref.value = `${path.pathname}${path.search}`;

            updateSetting('WebUI_Settings', 'theme', `theme-${data.ID}`);
            toast.info(`Successfully uploaded theme "${data.Name}"`);
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
      <title>Settings &gt; General | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">General</div>
        <div>
          Here you can find settings for version details, theme customization, notification management, and log
          configurations.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Version Information</div>
          <Button
            buttonType="primary"
            buttonSize="small"
            className="flex flex-row flex-wrap items-center gap-x-2"
            onClick={() => {
              checkWebuiUpdateQuery.refetch().then(() => {}, () => {});
            }}
            tooltip="Check for WebUI Update"
          >
            <Icon
              path={mdiRefresh}
              size={0.85}
              spin={checkWebuiUpdateQuery.isFetching}
            />
            <span>Refresh</span>
          </Button>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="flex h-8 justify-between">
            <span>Server Version</span>
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
            <span>Server Channel</span>
            {versionQuery.data?.Server.ReleaseChannel}
          </div>
          <div className="flex h-8 justify-between">
            <span>Web UI Version</span>
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
            <span>Web UI Channel</span>
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
          <div className="font-semibold">Theme Options</div>
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
            tooltip="Upload or install a new Theme"
          >
            <Icon
              path={mdiBrushOutline}
              size={0.85}
            />
            <span>Upload Theme</span>
          </Button>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            Theme
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
            <span>Description</span>
            <span className="max-w-xs truncate">{currentTheme?.Description ?? 'The default theme.'}</span>
          </div>
          <div className="flex h-8 items-center justify-between">
            <span>Version</span>
            {currentTheme?.Version ?? '1.0.0'}
          </div>
          <div className="flex h-8 items-center justify-between">
            <span>Author</span>
            {currentTheme?.Author ?? 'Shoko Staff'}
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex justify-between">
          <div className="flex items-center font-semibold">Notification Options</div>
          <Checkbox
            label="Enable"
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
          <span>Notification Position</span>
          <SelectSmall
            id="toast-position"
            value={WebUI_Settings.toastPosition}
            onChange={event => updateSetting('WebUI_Settings', 'toastPosition', event.target.value)}
          >
            <option value="bottom-right">Bottom Right</option>
            <option value="top-right">Top Right</option>
          </SelectSmall>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex justify-between">
          <div className="flex items-center font-semibold">Log Options</div>
          <Checkbox
            id="enable-logs"
            label="Enable"
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
            label="Compress Logs"
            id="compress-logs"
            isChecked={LogRotator.Zip}
            onChange={event => updateSetting('LogRotator', 'Zip', event.target.checked)}
          />
          <Checkbox
            justify
            label="Delete Older Logs"
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
            <span>Delete Frequency</span>
            <SelectSmall
              id="delete-frequency"
              value={LogRotator.Delete_Days}
              onChange={event => updateSetting('LogRotator', 'Delete_Days', event.target.value)}
            >
              <option value="0">Never</option>
              <option value="7">Daily</option>
              <option value="30">Monthly</option>
              <option value="90">Quarterly</option>
            </SelectSmall>
          </div>
          <Checkbox
            justify
            label="Trace Logs"
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
