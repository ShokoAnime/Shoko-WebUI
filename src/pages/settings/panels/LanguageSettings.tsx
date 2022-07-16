import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { remove } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { DropResult } from 'react-beautiful-dnd';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import DnDList from '../../../components/DnDList/DnDList';
import Checkbox from '../../../components/Input/Checkbox';
import Button from '../../../components/Input/Button';
import { setStatus as setLanguagesModalStatus } from '../../../core/slices/modals/languages';
import { languageDescription } from '../../../components/Dialogs/LanguagesModal';

function LanguageSettings() {
  const dispatch = useDispatch();

  const isFetching = useSelector((state: RootState) => state.fetching.settings);
  const LanguagePreference = useSelector(
    (state: RootState) => state.localSettings.LanguagePreference,
  );
  const LanguageUseSynonyms = useSelector(
    (state: RootState) => state.localSettings.LanguageUseSynonyms,
  );

  const saveSettings = (newSettings: { [id: string]: any }) => dispatch(
    { type: Events.SETTINGS_SAVE_SERVER, payload: { newSettings } },
  );

  const handleInputChange = (event: any) => {
    const { id, checked: value } = event.target;
    saveSettings({ [id]: value });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    const items = Array.from(LanguagePreference);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);

    saveSettings({ LanguagePreference: items });
  };

  const removeLanguage = (language: string) => {
    const items = Array.from(LanguagePreference);
    remove(items, item => item === language);
    saveSettings({ LanguagePreference: items });
  };

  const renderItem = (language: string) => (
    <div className="flex justify-between items-center mt-1">
      {languageDescription[language]}
      <Button onClick={() => removeLanguage(language)} tooltip="Remove" className="color-danger">
        <FontAwesomeIcon icon={faTrash} className="align-middle text-sm" />
      </Button>
    </div>
  );

  const renderOptions = () => (
    <div className="flex">
      <Button onClick={() => dispatch(setLanguagesModalStatus(true))} tooltip="Add Language" className="color-highlight-1">
        <FontAwesomeIcon icon={faPlus} />
      </Button>
    </div>
  );

  return (
    <FixedPanel title="Language" options={renderOptions()} isFetching={isFetching}>

      <Checkbox label="Also Use Synonyms" id="LanguageUseSynonyms" isChecked={LanguageUseSynonyms} onChange={handleInputChange} />

      <div className="font-bold mt-3">Priority (Drag to Reorder)</div>
      <DnDList onDragEnd={onDragEnd}>
        {LanguagePreference.map(language => ({ key: language, item: renderItem(language) }))}
      </DnDList>

    </FixedPanel>
  );
}

export default LanguageSettings;
