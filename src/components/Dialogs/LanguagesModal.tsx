import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { remove } from 'lodash';
import { initialSettings } from '@/pages/settings/SettingsPage';
import { useGetSettingsQuery, usePatchSettingsMutation } from '@/core/rtkQuery/splitV3Api/settingsApi';
import ModalPanel from '../Panels/ModalPanel';
import Button from '../Input/Button';
import Checkbox from '../Input/Checkbox';

export const languageDescription = {
  'x-jat': 'Romaji (x-jat)',
  'x-zht': 'Pinyin (x-zht)',
  en: 'English (en)',
  ja: 'Japanese (ja)',
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

type Props = {
  type: 'Series' | 'Episode' | null;
  onClose: () => void;
};

function LanguagesModal({ type, onClose }: Props) {
  const settingsQuery = useGetSettingsQuery();
  const settings = useMemo(() => settingsQuery.data ?? initialSettings, [settingsQuery]);
  const LanguagePreference = useMemo(() => type === 'Episode' ? settings.EpisodeLanguagePreference ?? ['en'] : settings.LanguagePreference ?? ['x-jat', 'en'], [type, settings]);
  const [patchSettings] = usePatchSettingsMutation();

  const [languages, setLanguages] = useState([] as Array<string>);

  const handleSave = useCallback(() => {
    patchSettings({ oldSettings: settings, newSettings: { ...settings, [type === 'Episode' ? 'EpisodeLanguagePreference' : 'LanguagePreference']: languages } }).unwrap()
      .then(() => onClose())
      .catch(error => console.error(error));
  }, [type, settings, languages, patchSettings, onClose]);

  useEffect(() => {
    if (type !== null) setLanguages(LanguagePreference);
  }, [type, LanguagePreference]);

  const handleInputChange = (event: any) => {
    const { id, checked: value } = event.target;

    const newLanguages = languages.slice();

    if (value) newLanguages.push(id);
    else remove(newLanguages, item => item === id);

    setLanguages(newLanguages);
  };

  return (
    <ModalPanel
      show={type !== null}
      onRequestClose={onClose}
      className="p-8 flex-col drop-shadow-lg gap-y-4 h-2/3"
    >
      <div className="font-semibold text-xl">{type} Languages</div>
      <div className="flex flex-col overflow-y-auto bg-background-border rounded-md border border-background-border px-3 py-2 gap-y-1.5">
        {Object.keys(languageDescription).map(key => (
          <Checkbox id={key} key={key} isChecked={languages.includes(key)} onChange={handleInputChange} label={languageDescription[key]} justify />
        ))}
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} className="bg-background-nav px-5 py-2 text-font-main">Discard</Button>
        <Button onClick={handleSave} className="bg-highlight-1 px-5 py-2" disabled={languages.length === 0}>Save</Button>
      </div>
    </ModalPanel>
  );
}

export default LanguagesModal;
