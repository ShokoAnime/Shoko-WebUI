import React, { useEffect, useMemo, useState } from 'react';
import { keys, map, remove } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import useEventCallback from '@/hooks/useEventCallback';

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

function LanguagesModal({ onClose, type }: Props) {
  const settings = useSettingsQuery().data;
  const LanguagePreference = useMemo(
    () => (type === 'Episode'
      ? settings.EpisodeLanguagePreference
      : settings.LanguagePreference),
    [type, settings],
  );
  const { mutate: patchSettings } = usePatchSettingsMutation();

  const [languages, setLanguages] = useState([] as string[]);

  const handleSave = useEventCallback(() => {
    patchSettings({
      newSettings: {
        ...settings,
        [type === 'Episode' ? 'EpisodeLanguagePreference' : 'LanguagePreference']: languages,
      },
    }, {
      onSuccess: () => onClose(),
    });
  });

  useEffect(() => {
    if (type !== null) setLanguages(LanguagePreference);
  }, [type, LanguagePreference]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked: value, id } = event.target;

    const newLanguages = languages.slice();

    if (value) newLanguages.push(id);
    else remove(newLanguages, item => item === id);

    setLanguages(newLanguages);
  };

  return (
    <ModalPanel
      show={type !== null}
      onRequestClose={onClose}
      header={`${type} Languages`}
    >
      <div className="w-full rounded-md border border-panel-border bg-panel-input p-4 capitalize">
        <div className="flex h-80 flex-col gap-y-1.5 overflow-y-auto rounded-md bg-panel-input px-3 py-2">
          {map(keys(languageDescription), (key: keyof typeof languageDescription) => (
            <Checkbox
              id={key}
              key={key}
              isChecked={languages.includes(key)}
              onChange={handleInputChange}
              label={languageDescription[key]}
              justify
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-5 py-2">Discard</Button>
        <Button onClick={handleSave} buttonType="primary" className="px-5 py-2" disabled={languages.length === 0}>
          Save
        </Button>
      </div>
    </ModalPanel>
  );
}

export default LanguagesModal;
