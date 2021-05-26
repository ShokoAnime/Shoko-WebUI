import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach, remove } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { DropResult } from 'react-beautiful-dnd';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import DnDList from '../../../components/DnDList/DnDList';
import Checkbox from '../../../components/Input/Checkbox';
import Button from '../../../components/Input/Button';
import { setStatus } from '../../../core/slices/modals/languages';
import { languageDescription } from '../../../components/Dialogs/LanguagesModal';

class LanguageSettings extends React.Component<Props> {
  onDragEnd = (result: DropResult) => {
    const { languages, saveSettings } = this.props;

    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    const items = Array.from(languages);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);

    saveSettings({ newSettings: { LanguagePreference: items } });
  };

  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id, checked: value } = event.target;
    saveSettings({ newSettings: { [id]: value } });
  };

  removeLanguage = (language: string) => {
    const { languages, saveSettings } = this.props;

    const items = Array.from(languages);
    remove(items, item => item === language);
    saveSettings({ newSettings: { LanguagePreference: items } });
  };

  renderItem = (language: string) => (
    <div className="flex justify-between items-center mt-1">
      {languageDescription[language]}
      <Button onClick={() => this.removeLanguage(language)} tooltip="Remove" className="color-danger">
        <FontAwesomeIcon icon={faTrash} className="align-middle text-sm" />
      </Button>
    </div>
  );

  renderOptions = () => {
    const { setLanguagesModalStatus } = this.props;

    return (
      <div className="flex">
        <Button onClick={() => setLanguagesModalStatus(true)} tooltip="Add Language" className="color-highlight-1">
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </div>
    );
  };

  render() {
    const { isFetching, languages, LanguageUseSynonyms } = this.props;

    const items: Array<{ key: string, item: React.ReactNode }> = [];

    forEach(languages, (language) => {
      items.push({
        key: language,
        item: this.renderItem(language),
      });
    });

    return (
      <FixedPanel title="Language" options={this.renderOptions()} isFetching={isFetching}>

        <Checkbox label="Also Use Synonyms" id="LanguageUseSynonyms" isChecked={LanguageUseSynonyms} onChange={this.handleInputChange} />

        <div className="font-bold mt-3">Priority (Drag to Reorder)</div>
        <DnDList onDragEnd={this.onDragEnd}>{items}</DnDList>

      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  languages: state.localSettings.LanguagePreference,
  LanguageUseSynonyms: state.localSettings.LanguageUseSynonyms,
  isFetching: state.fetching.settings,
});

const mapDispatch = {
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
  setLanguagesModalStatus: (payload: boolean) => (setStatus(payload)),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(LanguageSettings);
