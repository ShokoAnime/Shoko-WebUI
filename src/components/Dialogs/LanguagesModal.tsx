import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forEach, remove } from 'lodash';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { setStatus as setLanguageModalStatus } from '../../core/slices/modals/languages';
import ModalPanel from '../Panels/ModalPanel';
import Button from '../Input/Button';
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

function LanguagesModal() {
  const dispatch = useDispatch();

  const status = useSelector((state: RootState) => state.modals.languages.status);
  const LanguagePreference = useSelector(
    (state: RootState) => state.localSettings.LanguagePreference,
  );

  const [languages, setLanguages] = useState([] as Array<string>);

  const handleClose = () => dispatch(setLanguageModalStatus(false));

  const handleSave = () => {
    dispatch({
      type: Events.SETTINGS_SAVE_SERVER,
      payload: { newSettings: { LanguagePreference: languages } },
    });
    handleClose();
  };

  useEffect(() => {
    if (status) setLanguages(LanguagePreference);
  }, [status]);

  const handleInputChange = (event: any) => {
    const { id, checked: value } = event.target;

    const newLanguages = languages.slice();

    if (value) newLanguages.push(id);
    else remove(newLanguages, item => item === id);

    setLanguages(newLanguages);
  };

  const items: Array<React.ReactNode> = [];

  forEach(languageDescription, (language, key) => {
    items.push(<Checkbox
      label={language}
      id={key}
      key={key}
      isChecked={languages.includes(key)}
      onChange={handleInputChange}
      className="mr-2"
    />);
  });

  return (
    <ModalPanel show={status} className="languages-modal px-6 pt-3 pb-5" onRequestClose={() => handleClose()}>
      <div className="flex flex-col w-full">
        <span className="flex font-semibold text-xl2 uppercase">
          Languages
        </span>
        <div className="bg-color-highlight-2 my-2 h-1 w-10 flex-shrink-0" />
        <div className="flex flex-col grow overflow-y-auto my-2">
          {items}
        </div>
        <div className="flex justify-end mt-2">
          <Button onClick={handleClose} className="bg-color-danger px-5 py-2 mr-2">Discard</Button>
          <Button onClick={handleSave} className="bg-highlight-1 px-5 py-2">Save</Button>
        </div>
      </div>
    </ModalPanel>
  );
}

export default LanguagesModal;
