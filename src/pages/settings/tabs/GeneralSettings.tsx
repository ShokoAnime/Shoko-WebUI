/* eslint-disable @typescript-eslint/naming-convention */
import React, { useMemo } from 'react';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import { mdiOpenInNew, mdiRefresh } from '@mdi/js';

import { uiVersion } from '@/core/util';

import { useGetInitVersionQuery } from '@/core/rtkQuery/splitV3Api/initApi';
import SelectSmall from '@/components/Input/SelectSmall';
import Checkbox from '@/components/Input/Checkbox';
import Button from '@/components/Input/Button';
import { useGetWebuiThemesQuery, useLazyGetWebuiUpdateCheckQuery } from '@/core/rtkQuery/splitV3Api/webuiApi';
import { useSettingsContext } from '../SettingsPage';

const UI_VERSION = uiVersion();

const exclusionMapping = {
  dissimilarTitles: {
    id: 'AllowDissimilarTitleExclusion',
    name: 'Dissimilar Titles',
  },
  prequel: {
    id: 'prequel',
    name: 'Prequel',
  },
  sequel: {
    id: 'sequel',
    name: 'Sequel',
  },
  ova: {
    id: 'ova',
    name: 'OVA',
  },
  movie: {
    id: 'movie',
    name: 'Movie',
  },
  sameSetting: {
    id: 'same setting',
    name: 'Same Setting',
  },
  altSetting: {
    id: 'alternative setting',
    name: 'Alternative Setting',
  },
  altVersion: {
    id: 'alternative version',
    name: 'Alternative Version',
  },
  parentStory: {
    id: 'parent story',
    name: 'Parent Story',
  },
  sideStory: {
    id: 'side story',
    name: 'Side Story',
  },
  fullStory: {
    id: 'full story',
    name: 'Full Story',
  },
  summary: {
    id: 'summary',
    name: 'Summary',
  },
  character: {
    id: 'character',
    name: 'Character',
  },
  other: {
    id: 'other',
    name: 'Other',
  },
};

function GeneralSettings() {
  const { newSettings, setNewSettings, updateSetting } = useSettingsContext();

  const {
    AutoGroupSeries, AutoGroupSeriesRelationExclusions,
    AutoGroupSeriesUseScoreAlgorithm,
    LogRotator, WebUI_Settings, TraceLog,
  } = newSettings;

  const [webuiUpdateCheck, webuiUpdateCheckResult] = useLazyGetWebuiUpdateCheckQuery();
  const version = useGetInitVersionQuery();
  const themes = useGetWebuiThemesQuery();

  const currentTheme = useMemo(() => (
    themes.data?.find(theme => `theme-${theme.ID}` === WebUI_Settings.theme)
  ), [themes, WebUI_Settings.theme]);

  const handleExclusionChange = (event: any) => {
    const { id, checked } = event.target;

    if (checked) {
      const tempExclusions = [...AutoGroupSeriesRelationExclusions, exclusionMapping[id].id];
      setNewSettings({ ...newSettings, AutoGroupSeriesRelationExclusions: tempExclusions });
    } else {
      const tempExclusions = AutoGroupSeriesRelationExclusions.filter(exclusion => exclusion !== exclusionMapping[id].id);
      setNewSettings({ ...newSettings, AutoGroupSeriesRelationExclusions: tempExclusions });
    }
  };

  return (
    <>
      <div className="font-semibold text-xl">General</div>
      <div className="flex flex-col mt-0.5 gap-y-4 border-b border-panel-border pb-8">
        <div className="flex justify-between">
          <div className="font-semibold">Version Information</div>
          <Button
            onClick={() => webuiUpdateCheck({ channel: newSettings.WebUI_Settings.updateChannel, force: true })}
            tooltip="Check for WebUI Update"
          >
            <Icon path={mdiRefresh} size={1} className="text-panel-primary" spin={webuiUpdateCheckResult.isFetching} />
          </Button>
        </div>
        <div className="flex flex-col gap-y-2">
          <div className="flex justify-between"><span>Server Version</span>
            <div className="flex gap-2">
              {version.data?.Server.Version}
              <a
                className="text-panel-primary"
                target="_blank"
                href={`https://github.com/ShokoAnime/ShokoServer/compare/${version.data?.Server.Commit?.slice(0, 7)}...master`}
                rel="noreferrer"
              >
                {`(${version.data?.Server.Commit?.slice(0, 7)})`}
              </a>
              <Icon className="text-panel-primary" path={mdiOpenInNew} size={1} />
            </div>
          </div>
          <div className="flex justify-between"><span>Server Channel</span>{version.data?.Server.ReleaseChannel}</div>
          <div className="flex justify-between"><span>Web UI Version</span>
            <div className="flex gap-2">
              {version.data?.WebUI?.Version}
              <a className="text-panel-primary" target="_blank" href={`https://github.com/ShokoAnime/Shoko-WebUI/compare/${UI_VERSION}...master`} rel="noreferrer">{`(${UI_VERSION})`}</a>
              <Icon className="text-panel-primary" path={mdiOpenInNew} size={1} />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span>Web UI Channel</span>
            <SelectSmall id="update-channel" value={WebUI_Settings.updateChannel} onChange={event => updateSetting('WebUI_Settings', 'updateChannel', event.target.value)}>
              <option value="Stable">Stable</option>
              <option value="Dev">Dev</option>
            </SelectSmall>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-4 border-b border-panel-border pb-8">
        <div className="font-semibold">Theme Options</div>
        <div className="flex flex-col gap-y-2">
          <div className="flex justify-between items-center">
            Theme
            <SelectSmall id="theme" value={WebUI_Settings.theme} onChange={event => updateSetting('WebUI_Settings', 'theme', event.target.value)}>
              <option value="theme-shoko-gray" key="shoko-gray">Shoko Gray (Default)</option>
              {themes.data?.map(theme => <option value={`theme-${theme.ID}`} key={theme.ID}>{theme.Name}</option>)}
            </SelectSmall>
          </div>
          <div className="flex justify-between items-center">
            <span>Description</span>
            <span className="max-w-xs truncate">{currentTheme?.Description ?? 'The default theme.'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Version</span>
            {currentTheme?.Version ?? '1.0.0'}
          </div>
          <div className="flex justify-between items-center">
            <span>Author</span>
            {currentTheme?.Author ?? 'Shoko Staff'}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-4 border-b border-panel-border pb-8">
        <div className="flex justify-between">
          <div className="font-semibold">Notification Options</div>
          <Checkbox label="Enable" id="enable-notifications" isChecked={WebUI_Settings?.notifications ?? true} onChange={event => updateSetting('WebUI_Settings', 'notifications', event.target.checked)} />
        </div>
        <div className={cx('flex justify-between items-center transition-opacity', !(WebUI_Settings?.notifications ?? true) && 'pointer-events-none opacity-50')}>
          <span>Notification Position</span>
          <SelectSmall id="toast-position" value={WebUI_Settings.toastPosition} onChange={event => updateSetting('WebUI_Settings', 'toastPosition', event.target.value)}>
            <option value="bottom-right">Bottom Right</option>
            <option value="top-right">Top Right</option>
          </SelectSmall>
        </div>
      </div>

      <div className="flex flex-col gap-y-4 border-b border-panel-border pb-8">
        <div className="flex justify-between">
          <div className="font-semibold">Log Options</div>
          <Checkbox id="enable-logs" label="Enable" isChecked={LogRotator.Enabled} onChange={event => updateSetting('LogRotator', 'Enabled', event.target.checked)} />
        </div>
        <div className={cx('flex flex-col transition-opacity gap-y-2', !LogRotator.Enabled && 'pointer-events-none opacity-50')}>
          <Checkbox justify label="Compress Logs" id="compress-logs" isChecked={LogRotator.Zip} onChange={event => updateSetting('LogRotator', 'Zip', event.target.checked)} />
          <Checkbox justify label="Delete Older Logs" id="delete-logs" isChecked={LogRotator.Delete} onChange={event => updateSetting('LogRotator', 'Delete', event.target.checked)} />
          <div className={cx('flex justify-between items-center transition-opacity', !LogRotator.Delete && 'pointer-events-none opacity-50')}>
            <span>Delete Frequency</span>
            <SelectSmall id="delete-frequency" value={LogRotator.Delete_Days} onChange={event => updateSetting('LogRotator', 'Delete_Days', event.target.value)}>
              <option value="0">Never</option>
              <option value="7">Daily</option>
              <option value="30">Monthly</option>
              <option value="90">Quarterly</option>
            </SelectSmall>
          </div>
          <Checkbox justify label="Trace Logs" id="trace-logs" isChecked={TraceLog} onChange={event => setNewSettings({ ...newSettings, TraceLog: event.target.checked })} />
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="font-semibold">Relation Options</div>
        <div className="flex flex-col gap-y-2 border-b border-panel-border pb-8">
          <Checkbox justify label="Auto Group Series" id="auto-group-series" isChecked={AutoGroupSeries} onChange={event => setNewSettings({ ...newSettings, AutoGroupSeries: event.target.checked })} />
          <Checkbox justify label="Determine Main Series Using Relation Weighing" id="auto-group-using-score" isChecked={AutoGroupSeriesUseScoreAlgorithm} onChange={event => setNewSettings({ ...newSettings, AutoGroupSeriesUseScoreAlgorithm: event.target.checked })} />
          Exclude following relations
          <div className="flex flex-col bg-panel-background-alt border border-panel-border rounded-md p-4 2 gap-y-2.5">
            {Object.keys(exclusionMapping).map(item => (
              <Checkbox justify label={exclusionMapping[item].name} id={item} isChecked={AutoGroupSeriesRelationExclusions.includes(exclusionMapping[item].id)} onChange={handleExclusionChange} key={item} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default GeneralSettings;
