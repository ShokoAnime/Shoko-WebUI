import type { ChangeEvent, ChangeEventHandler } from 'react';
import { produce } from 'immer';

import Checkbox from '@/components/Input/Checkbox';

import type { SettingsContextType } from '@/core/types/context';

type Props = SettingsContextType;

const AnilistSettings = (props: Props) => {
  const { newSettings, setNewSettings, updateSetting } = props;

  const {
    AutoLink,
    AutoLinkRestricted,
    ConsiderExistingOtherLinks,
  } = newSettings.Anilist;

  const { includeRestricted } = newSettings.WebUI_Settings.collection.anilist;

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const propId = event.target.id.replace('Anilist_', '');
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    updateSetting('Anilist', propId, value);
  };

  const handleIncludeRestrictedChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setNewSettings(produce(newSettings, (draftState) => {
      draftState.WebUI_Settings.collection.anilist.includeRestricted = value;
    }));
  };

  return (
    <>
      <Checkbox
        justify
        label="Auto Link"
        id="Anilist_AutoLink"
        isChecked={AutoLink}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label="Auto Link Restricted"
        id="Anilist_AutoLinkRestricted"
        isChecked={AutoLinkRestricted}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label="Consider Existing Links From Other Sources"
        id="Anilist_ConsiderExistingOtherLinks"
        isChecked={ConsiderExistingOtherLinks}
        onChange={handleInputChange}
      />
      <Checkbox
        justify
        label="Include Restricted in Search"
        id="include-restricted-anilist"
        isChecked={includeRestricted}
        onChange={handleIncludeRestrictedChange}
      />
    </>
  );
};

export default AnilistSettings;
