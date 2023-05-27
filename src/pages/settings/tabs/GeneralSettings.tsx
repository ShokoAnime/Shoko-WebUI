/* eslint-disable @typescript-eslint/naming-convention */
import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { findKey, pickBy, transform } from 'lodash';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import { mdiRefresh } from '@mdi/js';

import { uiVersion } from '@/core/util';

import { useSettingsContext } from '../SettingsPage';

import { useGetInitVersionQuery } from '@/core/rtkQuery/splitV3Api/initApi';
import SelectSmall from '@/components/Input/SelectSmall';
import Checkbox from '@/components/Input/Checkbox';
import Button from '@/components/Input/Button';
import { splitV3Api } from '@/core/rtkQuery/splitV3Api';
import { useGetWebuiThemesQuery } from '@/core/rtkQuery/splitV3Api/webuiApi';

const UI_VERSION = uiVersion();

const mapping = {
  fullStory: 'full story',
  summary: 'summary',
  parentStory: 'parent story',
  sideStory: 'side story',
  prequel: 'prequel',
  sequel: 'sequel',
  altSetting: 'alternative setting',
  altVersion: 'alternative version',
  sameSetting: 'same setting',
  character: 'character',
  other: 'other',
  dissimilarTitles: 'AllowDissimilarTitleExclusion',
  ova: 'ova',
  movie: 'movie',
};

function GeneralSettings() {
  const dispatch = useDispatch();

  const { newSettings, setNewSettings, updateSetting } = useSettingsContext();

  const {
    AutoGroupSeries, AutoGroupSeriesRelationExclusions,
    AutoGroupSeriesUseScoreAlgorithm,
    LogRotator, WebUI_Settings, TraceLog,
  } = newSettings;

  const version = useGetInitVersionQuery();
  const themes = useGetWebuiThemesQuery();

  const currentTheme = useMemo(() => {
    if (!themes.data) return;
    return themes.data.find(theme => `theme-${theme.ID}` === WebUI_Settings.theme);
  }, [themes.requestId, themes.isSuccess, WebUI_Settings.theme]);

  const exclusions = useMemo(() => {
    return transform(AutoGroupSeriesRelationExclusions.split('|'), (result, item) => {
      const key = findKey(mapping, value => value === item);
      // eslint-disable-next-line no-param-reassign
      if (key) result[key] = true;
    }, exclusions);
  },
  [AutoGroupSeriesRelationExclusions]);

  const handleExclusionChange = (event: any) => {
    const { id, checked: value } = event.target;

    const tempExclusions = { ...exclusions, [id]: value };
    const newExclusions = Object.keys(pickBy(tempExclusions)).map(exclusion => mapping[exclusion]);

    setNewSettings({ ...newSettings, AutoGroupSeriesRelationExclusions: newExclusions.join('|') });
  };

  const {
    fullStory, summary, parentStory, sideStory, prequel,
    sequel, altSetting, altVersion, sameSetting, character,
    other, dissimilarTitles, ova, movie,
  } = exclusions;

  return (
    <>
      <div className='font-semibold text-xl'>General</div>
      <div className="flex flex-col mt-0.5 gap-y-4">
        <div className="flex justify-between">
          <div className="font-semibold">Version Information</div>
          <Button onClick={() => dispatch(splitV3Api.util.invalidateTags(['WebUIUpdateCheck']))} tooltip="Check for WebUI Update">
            <Icon path={mdiRefresh} size={1} className="text-highlight-1" />
          </Button>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="flex justify-between"><span>Server Version</span>{version.data?.Server.ReleaseChannel !== 'Stable' ? (
            `${version.data?.Server.Version} (${version.data?.Server.Commit?.slice(0, 7)})`
          ) : (
            version.data?.Server.Version
          )}
          </div>
          <div className="flex justify-between"><span>Server Channel</span>{version.data?.Server.ReleaseChannel}</div>
          <div className="flex justify-between"><span>Web UI Version</span>{UI_VERSION}</div>
          <div className="flex justify-between items-center">
            <span>Web UI Channel</span>
            <SelectSmall id="update-channel" value={WebUI_Settings.updateChannel} onChange={event => updateSetting('WebUI_Settings', 'updateChannel', event.target.value)}>
              <option value="Stable">Stable</option>
              <option value="Dev">Dev</option>
            </SelectSmall>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="font-semibold">Theme Options</div>
        <div className="flex flex-col gap-y-1">
          <div className="flex justify-between items-center">
            Theme
            <SelectSmall id="theme" value={WebUI_Settings.theme} onChange={event => updateSetting('WebUI_Settings', 'theme', event.target.value)}>
              {themes.data?.map(theme => <option value={`theme-${theme.ID}`} key={theme.ID}>{theme.Name}</option>)}
            </SelectSmall>
          </div>
          <div className="flex justify-between items-center">
            <span>Description</span>
            {currentTheme?.Description ?? '-'}
          </div>
          <div className="flex justify-between items-center">
            <span>Version</span>
            {currentTheme?.Version ?? '-'}
          </div>
          <div className="flex justify-between items-center">
            <span>Author</span>
            {currentTheme?.Author ?? '-'}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
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

      <div className="flex flex-col gap-y-4">
        <div className="flex justify-between">
          <div className="font-semibold">Log Options</div>
          <Checkbox id="enable-logs" label="Enable" isChecked={LogRotator.Enabled} onChange={event => updateSetting('LogRotator', 'Enabled', event.target.checked)} />
        </div>
        <div className={cx('flex flex-col transition-opacity gap-y-1', !LogRotator.Enabled && 'pointer-events-none opacity-50')}>
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
        <div className="flex flex-col gap-y-1">
          <Checkbox justify label="Auto Group Series" id="auto-group-series" isChecked={AutoGroupSeries} onChange={event => setNewSettings({ ...newSettings, AutoGroupSeries: event.target.checked })} />
          <Checkbox justify label="Determine Main Series Using Relation Weighing" id="auto-group-using-score" isChecked={AutoGroupSeriesUseScoreAlgorithm} onChange={event => setNewSettings({ ...newSettings, AutoGroupSeriesUseScoreAlgorithm: event.target.checked })} />
          Exclude following relations
          <div className="flex flex-col bg-background-border border border-background-border rounded-md px-3 py-2 gap-y-1.5">
            <Checkbox justify label="Dissimilar Titles" id="dissimilarTitles" isChecked={dissimilarTitles} onChange={handleExclusionChange} />
            <Checkbox justify label="Prequel" id="prequel" isChecked={prequel} onChange={handleExclusionChange} />
            <Checkbox justify label="Sequel" id="sequel" isChecked={sequel} onChange={handleExclusionChange} />
            <Checkbox justify label="OVA" id="ova" isChecked={ova} onChange={handleExclusionChange} />
            <Checkbox justify label="Movie" id="movie" isChecked={movie} onChange={handleExclusionChange} />
            <Checkbox justify label="Same Setting" id="sameSetting" isChecked={sameSetting} onChange={handleExclusionChange} />
            <Checkbox justify label="Alternative Setting" id="altSetting" isChecked={altSetting} onChange={handleExclusionChange} />
            <Checkbox justify label="Alternative Version" id="altVersion" isChecked={altVersion} onChange={handleExclusionChange} />
            <Checkbox justify label="Parent Story" id="parentStory" isChecked={parentStory} onChange={handleExclusionChange} />
            <Checkbox justify label="Side Story" id="sideStory" isChecked={sideStory} onChange={handleExclusionChange} />
            <Checkbox justify label="Full Story" id="fullStory" isChecked={fullStory} onChange={handleExclusionChange} />
            <Checkbox justify label="Summary" id="summary" isChecked={summary} onChange={handleExclusionChange} />
            <Checkbox justify label="Character" id="character" isChecked={character} onChange={handleExclusionChange} />
            <Checkbox justify label="Other" id="other" isChecked={other} onChange={handleExclusionChange} />
          </div>
        </div>
      </div>
    </>
  );
}

export default GeneralSettings;
