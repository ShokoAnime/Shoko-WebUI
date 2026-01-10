import React from 'react';
import { useTranslation } from 'react-i18next';
import { produce } from 'immer';

import Checkbox from '@/components/Input/Checkbox';

import type { SettingsContextType } from '@/core/types/context';

type Props = SettingsContextType;

const TMDBSettings = React.memo((props: Props) => {
  const { t } = useTranslation('settings');
  const { newSettings, setNewSettings, updateSetting } = props;

  const {
    AutoLink,
    AutoLinkRestricted,
  } = newSettings.TMDB;

  const { includeRestricted } = newSettings.WebUI_Settings.collection.tmdb;

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const propId = event.target.id.replace('TMDB_', '');
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    updateSetting('TMDB', propId, value);
  };

  const handleIncludeRestrictedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setNewSettings(produce(newSettings, (draftState) => {
      draftState.WebUI_Settings.collection.tmdb.includeRestricted = value;
    }));
  };

  return (
    <>
      <Checkbox
        justify
        label={t('tmdb.autoLink')}
        id="TMDB_AutoLink"
        isChecked={AutoLink}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label={t('tmdb.autoLinkRestricted')}
        id="TMDB_AutoLinkRestricted"
        isChecked={AutoLinkRestricted}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label={t('tmdb.includeRestricted')}
        id="include-restricted-tmdb"
        isChecked={includeRestricted}
        onChange={handleIncludeRestrictedChange}
      />
    </>
  );
});

export default TMDBSettings;
