import React from 'react';
import { useTranslation } from 'react-i18next';
import { produce } from 'immer';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import useSettingsContext from '@/hooks/useSettingsContext';

const ImportSettings = () => {
  const { t } = useTranslation('settings');
  const { newSettings, updateSetting } = useSettingsContext();

  const {
    AutomaticallyDeleteDuplicatesOnImport,
    RunOnStart,
    UseExistingFileWatchedStatus,
    VideoExtensions,
  } = newSettings.Import;

  const {
    AllowRelocationInsideDestinationOnImport,
    MoveOnImport,
    RenameOnImport,
  } = newSettings.Plugins.Renamer;

  const handleRenamerSettingChange = (
    type: 'MoveOnImport' | 'RenameOnImport' | 'AllowRelocationInsideDestinationOnImport',
    value: boolean,
  ) => {
    const renamerSettings = produce(newSettings.Plugins.Renamer, settings => ({
      ...settings,
      [type]: value,
    }));
    updateSetting('Plugins', 'Renamer', renamerSettings);
  };

  return (
    <>
      <title>Settings &gt; Import | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">{t('import.title')}</div>
        <div>
          {t('import.description')}
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="mt-0.5 flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">{t('import.options')}</div>
        <div className="flex flex-col gap-y-1">
          <Checkbox
            justify
            label={t('import.importOnStart')}
            id="import-on-start"
            isChecked={RunOnStart}
            onChange={event => updateSetting('Import', 'RunOnStart', event.target.checked)}
          />
          <Checkbox
            justify
            label={t('import.renameOnImport')}
            id="rename-on-import"
            isChecked={RenameOnImport}
            onChange={event => handleRenamerSettingChange('RenameOnImport', event.target.checked)}
          />
          <Checkbox
            justify
            label={t('import.moveOnImport')}
            id="move-on-import"
            isChecked={MoveOnImport}
            onChange={event => handleRenamerSettingChange('MoveOnImport', event.target.checked)}
          />
          <Checkbox
            justify
            label={t('import.allowRelocation')}
            id="allow-relocation-inside-destination-on-import"
            isChecked={AllowRelocationInsideDestinationOnImport}
            onChange={event =>
              handleRenamerSettingChange('AllowRelocationInsideDestinationOnImport', event.target.checked)}
          />
          <Checkbox
            justify
            label={t('import.deleteDuplicates')}
            id="delete-duplicates-on-import"
            isChecked={AutomaticallyDeleteDuplicatesOnImport}
            onChange={event => updateSetting('Import', 'AutomaticallyDeleteDuplicatesOnImport', event.target.checked)}
          />
          <Checkbox
            justify
            label={t('import.setFileWatched')}
            id="set-file-watched"
            isChecked={UseExistingFileWatchedStatus}
            onChange={event => updateSetting('Import', 'UseExistingFileWatchedStatus', event.target.checked)}
          />
          <div className="flex items-center justify-between">
            {t('import.videoExtensions')}
            <InputSmall
              id="username"
              value={VideoExtensions.join(',')}
              type="text"
              onChange={event => updateSetting('Import', 'VideoExtensions', event.target.value.split(','))}
              className="w-64 px-3 py-1"
            />
          </div>
        </div>
      </div>
      <div className="border-b border-panel-border" />
    </>
  );
};

export default ImportSettings;
