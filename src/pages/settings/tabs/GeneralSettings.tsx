import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';
import { mdiBrushOutline, mdiOpenInNew, mdiPower, mdiRefresh, mdiRestart } from '@mdi/js';
import { Icon } from '@mdi/react';
import { isAxiosError } from 'axios';
import cx from 'classnames';

import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import SelectSmall from '@/components/Input/SelectSmall';
import { useServerRestartMutation, useServerShutdownMutation } from '@/core/react-query/init/mutations';
import { useServerStatusQuery, useVersionQuery } from '@/core/react-query/init/queries';
import { useWebuiUploadThemeMutation } from '@/core/react-query/webui/mutations';
import {
  useServerUpdateCheckQuery,
  useWebuiThemesQuery,
  useWebuiUpdateCheckQuery,
} from '@/core/react-query/webui/queries';
import { clearAction, setAction } from '@/core/slices/serverLifecycle';
import { useDispatch } from '@/core/store';
import toast from '@/core/toast';
import { getUiVersion, isDebug } from '@/core/util';
import useNavigateVoid from '@/hooks/useNavigateVoid';
import useSettingsContext from '@/hooks/useSettingsContext';

let themeUpdateCounter = 0;

const UI_VERSION = getUiVersion();

const isNetworkError = (error: unknown): boolean => {
  if (!isAxiosError(error)) return false;
  return !error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error';
};

const GeneralSettings = () => {
  const { newSettings, updateSetting } = useSettingsContext();
  const dispatch = useDispatch();
  const navigate = useNavigateVoid();

  const {
    Logging,
    WebUI_Settings,
  } = newSettings;

  const serverUpdateCheckQuery = useServerUpdateCheckQuery(
    { channel: newSettings.WebUI_Settings.serverUpdateChannel, force: true },
    false,
  );
  const webuiUpdateCheckQuery = useWebuiUpdateCheckQuery(
    { channel: newSettings.WebUI_Settings.updateChannel, force: true },
    false,
  );
  const updateCheckIsFetching = webuiUpdateCheckQuery.isFetching || serverUpdateCheckQuery.isFetching;

  const themePathHref = useMemo(() => document.getElementById('theme-css')!.attributes.getNamedItem('href')!, []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const versionQuery = useVersionQuery();
  const serverStatusQuery = useServerStatusQuery();
  const { isPending: isRestarting, mutateAsync: restartServer } = useServerRestartMutation();
  const { isPending: isShuttingDown, mutateAsync: shutdownServer } = useServerShutdownMutation();
  const themesQuery = useWebuiThemesQuery();
  const { isPending: isUploading, mutate: uploadTheme } = useWebuiUploadThemeMutation();
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showShutdownConfirm, setShowShutdownConfirm] = useState(false);

  const onOpenFileDialog = (event: MouseEvent<HTMLButtonElement>) => {
    if (isUploading) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  const onConfirmRestart = async () => {
    dispatch(setAction('restarting'));
    try {
      await restartServer(undefined);
      navigate('/webui/status');
    } catch (error) {
      console.error(error);
      if (isNetworkError(error)) {
        // Server likely dropped the connection mid-restart; treat as success
        navigate('/webui/status');
        return;
      }
      dispatch(clearAction());
      toast.error('Failed to restart Shoko');
    }
  };

  const onConfirmShutdown = async () => {
    dispatch(setAction('shutting-down'));
    try {
      await shutdownServer(undefined);
      navigate('/webui/status');
    } catch (error) {
      console.error(error);
      if (isNetworkError(error)) {
        // Server likely dropped the connection mid-shutdown; treat as success
        navigate('/webui/status');
        return;
      }
      dispatch(clearAction());
      toast.error('Failed to shutdown Shoko');
    }
  };

  const currentTheme = useMemo(() => (
    themesQuery.data?.find(theme => `theme-${theme.ID}` === WebUI_Settings.theme)
  ), [themesQuery.data, WebUI_Settings.theme]);

  return (
    <>
      <title>Settings &gt; General | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">General</div>
          <div className="flex items-center gap-2">
            {serverStatusQuery.data?.CanRestart && (
              <>
                <Button
                  className="text-button-primary"
                  tooltip="Restart Shoko"
                  onClick={() => setShowRestartConfirm(true)}
                >
                  <Icon path={mdiRestart} size={1} spin={isRestarting} />
                </Button>
                <ConfirmationPromptModal
                  onConfirm={onConfirmRestart}
                  onClose={() => setShowRestartConfirm(false)}
                  show={showRestartConfirm}
                  confirmButtonType="primary"
                  confirmText="Restart"
                  title="Restart Shoko"
                >
                  Are you sure you want to restart Shoko?
                </ConfirmationPromptModal>
              </>
            )}
            {serverStatusQuery.data?.CanShutdown && (
              <>
                <Button
                  className="text-button-danger"
                  tooltip="Shutdown Shoko"
                  onClick={() => setShowShutdownConfirm(true)}
                >
                  <Icon path={mdiPower} size={1} spin={isShuttingDown} />
                </Button>
                <ConfirmationPromptModal
                  onConfirm={onConfirmShutdown}
                  onClose={() => setShowShutdownConfirm(false)}
                  show={showShutdownConfirm}
                  confirmButtonType="danger"
                  confirmText="Shutdown"
                  title="Shutdown Shoko"
                >
                  Are you sure you want to shutdown Shoko?
                </ConfirmationPromptModal>
              </>
            )}
          </div>
        </div>
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
              serverUpdateCheckQuery.refetch().catch(console.error);
              webuiUpdateCheckQuery.refetch().catch(console.error);
            }}
            tooltip="Check for WebUI Update"
          >
            <Icon
              path={mdiRefresh}
              size={0.85}
              spin={updateCheckIsFetching}
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
                href={`https://github.com/ShokoAnime/Shoko-WebUI/compare/${isDebug() ? '' : 'v'}${UI_VERSION}...master`}
                rel="noreferrer"
              >
                {`(${UI_VERSION})`}
                <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between">
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
            'flex items-center justify-between transition-opacity',
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
            isChecked={Logging.RotationEnabled}
            onChange={event => updateSetting('Logging', 'RotationEnabled', event.target.checked)}
          />
        </div>
        <div
          className={cx(
            'flex flex-col gap-y-2 transition-opacity',
            !Logging.RotationEnabled && 'pointer-events-none opacity-65',
          )}
        >
          <Checkbox
            justify
            label="Compress Logs"
            id="compress-logs"
            isChecked={Logging.RotationCompress}
            onChange={event => updateSetting('Logging', 'RotationCompress', event.target.checked)}
          />
          <Checkbox
            justify
            label="Delete Older Logs"
            id="delete-logs"
            isChecked={Logging.RotationDeleteEnabled}
            onChange={event => updateSetting('Logging', 'RotationDeleteEnabled', event.target.checked)}
          />
          <div
            className={cx(
              'flex items-center justify-between transition-opacity',
              !Logging.RotationDeleteEnabled && 'pointer-events-none opacity-65',
            )}
          >
            <span>Delete Frequency</span>
            <SelectSmall
              id="delete-frequency"
              value={Logging.RotationDeleteDays ?? ''}
              onChange={event =>
                updateSetting(
                  'Logging',
                  'RotationDeleteDays',
                  event.target.value ? parseInt(event.target.value, 10) : undefined,
                )}
            >
              <option value="">Never</option>
              <option value="7">Weekly</option>
              <option value="30">Monthly</option>
              <option value="90">Quarterly</option>
            </SelectSmall>
          </div>
          <Checkbox
            justify
            label="Trace Logs"
            id="trace-logs"
            isChecked={Logging.TraceLog}
            onChange={event => updateSetting('Logging', 'TraceLog', event.target.checked)}
          />
        </div>
      </div>
      <div className="border-b border-panel-border" />
    </>
  );
};

export default GeneralSettings;
