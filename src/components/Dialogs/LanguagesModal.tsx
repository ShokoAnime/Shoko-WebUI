import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach, remove, isEqual } from 'lodash';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { setStatus as setLanguageModalStatus } from '../../core/slices/modals/languages';
import ModalPanel from '../Panels/ModalPanel';
import Button from '../Buttons/Button';
import Checkbox from '../Input/Checkbox';

export const languageDescription = {
  'x-jat': 'Romaji (x-jat)',
  en: 'English (en)',
  ja: 'Kanji',
  ar: 'Arabic (ar)',
  bd: 'Bangladeshi (bd)',
  bg: 'Bulgarian (bd)',
  ca: 'Canadian-French (ca)',
  zh: 'Chinese',
  'zh-hans': 'Chinese (zh-hans)',
  'zh-hant': 'Chinese (zh-hant)',
  cs: 'Czech (cs)',
  cz: 'Czech (cz)',
  da: 'Danish (da)',
  dk: 'Danish (dk)',
  nl: 'Dutch (nl)',
  de: 'German (de)',
  el: 'Greek (el)',
  et: 'Estonian (et)',
  fi: 'Finnish (fi)',
  fr: 'French (fr)',
  gl: 'Galician (gl)',
  gr: 'Greek (gr)',
  he: 'Hebrew (he)',
  hu: 'Hungarian (hu)',
  il: 'Hebrew (il)',
  it: 'Italian (it)',
  ko: 'Korean (ko)',
  lv: 'Latvian (lv)',
  lt: 'Lithuanian (lt)',
  ms: 'Malaysian (ms)',
  my: 'Malaysian (my)',
  mn: 'Mongolian (mn)',
  no: 'Norwegian (no)',
  pl: 'Polish (pl)',
  pt: 'Portuguese (pt)',
  'pt-br': 'Portuguese - Brazil (pt-br)',
  ro: 'Romanian (ro)',
  ru: 'Russian (ru)',
  sr: 'Serbian (sr)',
  sk: 'Slovak (sk)',
  sl: 'Slovenian (sl)',
  es: 'Spanish (es)',
  sv: 'Swedish (sv)',
  se: 'Swedish (se)',
  th: 'Thai (th)',
  tr: 'Turkish (tr)',
  uk: 'Ukrainian (uk)',
  ua: 'Ukrainian (ua)',
  vi: 'Vietnamese (vi)',
};

type State = {
  languages: Array<string>;
  ownUpdate: boolean;
};

class LanguagesModal extends React.Component<Props, State> {
  state = {
    languages: [] as Array<string>,
    ownUpdate: false,
  };

  static getDerivedStateFromProps(props: Props, state: State) {
    if (state.ownUpdate) {
      return { ownUpdate: false };
    }

    if (!isEqual(props.languages, state.languages)) {
      return { languages: props.languages };
    }

    return null;
  }

  handleClose = () => {
    const { setStatus } = this.props;
    setStatus(false);
  };

  handleSave = () => {
    const { saveSettings } = this.props;
    const { languages } = this.state;
    saveSettings({ newSettings: { LanguagePreference: languages } });
    this.handleClose();
  };

  handleInputChange = (event: any) => {
    const { languages } = this.state;
    const { id, checked: value } = event.target;

    const newLanguages = languages.slice();

    if (value) newLanguages.push(id);
    else remove(newLanguages, item => item === id);

    this.setState({ languages: newLanguages, ownUpdate: true });
  };

  render() {
    const { show } = this.props;
    const { languages } = this.state;

    const items: Array<React.ReactNode> = [];

    forEach(languageDescription, (language, key) => {
      items.push(<Checkbox
        label={language}
        id={key}
        key={key}
        isChecked={languages.includes(key)}
        onChange={this.handleInputChange}
        className="mr-2"
      />);
    });

    return (
      <ModalPanel show={show} className="languages-modal px-6 pt-3 pb-5" onRequestClose={() => this.handleClose()}>
        <div className="flex flex-col w-full">
          <span className="flex font-semibold text-xl2 uppercase fixed-panel-header">
            Languages
          </span>
          <div className="bg-color-accent-secondary my-2 h-1 w-10 flex-shrink-0" />
          <div className="flex flex-col flex-grow overflow-y-auto my-2">
            {items}
          </div>
          <div className="flex justify-end mt-2">
            <Button onClick={this.handleClose} className="bg-color-danger px-5 py-2 mr-2">Discard</Button>
            <Button onClick={this.handleSave} className="bg-color-accent px-5 py-2">Save</Button>
          </div>
        </div>
      </ModalPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  show: state.modals.languages.status,
  languages: state.localSettings.LanguagePreference,
});

const mapDispatch = {
  setStatus: (value: boolean) => (setLanguageModalStatus(value)),
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(LanguagesModal);
