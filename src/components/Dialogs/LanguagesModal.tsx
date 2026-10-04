import type { ChangeEvent } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { keys, map, omit, remove } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import { addNoLanguageOption } from '@/core/react-query/settings/helpers';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery, useSupportedLanguagesQuery } from '@/core/react-query/settings/queries';
import useSyncedState from '@/hooks/useSyncedState';

import type { SettingsType } from '@/core/types/api/settings';

/** Languages picked for the caller instead of for the settings. */
export type LanguageSelectionType = {
  languages: string[];
  /** Takes the picked languages when the modal is saved; nothing is sent to the server. */
  onChange: (languages: string[]) => void;
  /** Whether several languages can be picked, as with a `<select multiple>`. Defaults to `true`. */
  multiple?: boolean;
  /** Offer an explicit choice of no language, e.g. "Any Language", which saves an empty list. */
  noneLabel?: string;
};

type Props = {
  type: 'Series' | 'Episode' | 'Description' | 'Image' | 'Track' | null;
  onClose: () => void;
  /** Pick for the caller instead of saving the language preference of `type`. */
  selection?: LanguageSelectionType;
  /** Language codes not offered, e.g. pseudo-languages that make no sense for the caller. */
  exclude?: string[];
};

// The key of the explicit "no language" choice. Not a language code the server knows.
const NONE_KEY = 'x-none-selected';

const getLanguagePreference = (type: Props['type'], settings: SettingsType, selection?: LanguageSelectionType) => {
  if (selection) return selection.languages;
  switch (type) {
    case 'Episode':
      return settings.Language.EpisodeTitleLanguageOrder;
    case 'Description':
      return settings.Language.DescriptionLanguageOrder;
    case 'Image':
      return settings.TMDB.ImageLanguageOrder;
    default:
      return settings.Language.SeriesTitleLanguageOrder;
  }
};

const LanguagesModal = ({ exclude, onClose, selection, type }: Props) => {
  const settings = useSettingsQuery().data;

  const languagesQuery = useSupportedLanguagesQuery();
  const supportedLanguages = omit(languagesQuery.data ?? {}, exclude ?? []);
  const languageDescription = type === 'Image'
    ? addNoLanguageOption(supportedLanguages)
    : supportedLanguages;
  const allowEmpty = type === 'Image' || !!selection?.noneLabel;

  const LanguagePreference = getLanguagePreference(type, settings, selection);
  const { mutate: patchSettings } = usePatchSettingsMutation();

  // A caller's languages are compared by value, as a caller may build the list anew on every render.
  let languageSource: string[] | string | null = null;
  if (type !== null) languageSource = selection ? selection.languages.join(',') : LanguagePreference;
  const [languages, setLanguages] = useSyncedState<string[] | string | null, string[]>(
    languageSource,
    (source) => {
      if (typeof source === 'string') return source === '' ? [] : source.split(',');
      return source ?? [];
    },
  );

  const handleSave = () => {
    if (selection) {
      selection.onChange(languages);
      onClose();
      return;
    }

    if (type === 'Image') {
      patchSettings({
        ...settings,
        TMDB: {
          ...settings.TMDB,
          ImageLanguageOrder: languages,
        },
      }, {
        onSuccess: onClose,
      });
      return;
    }

    let preferenceType = 'SeriesTitleLanguageOrder';
    if (type === 'Episode') {
      preferenceType = 'EpisodeTitleLanguageOrder';
    } else if (type === 'Description') {
      preferenceType = 'DescriptionLanguageOrder';
    }

    patchSettings({
      ...settings,
      Language: {
        ...settings.Language,
        [preferenceType]: languages,
      },
    }, {
      onSuccess: onClose,
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked: value, id } = event.target;

    if (id === NONE_KEY) {
      if (value) setLanguages([]);
      return;
    }

    if (selection?.multiple === false) {
      // Picking another language replaces the one picked; unpicking it leaves the explicit "no language" choice.
      setLanguages(value ? [id] : []);
      return;
    }

    const newLanguages = languages.slice();

    if (value) newLanguages.push(id);
    else remove(newLanguages, item => item === id);

    setLanguages(newLanguages);
  };

  return (
    <ModalPanel
      show={type !== null}
      onRequestClose={onClose}
      header={selection?.multiple === false ? `${type} Language` : `${type} Languages`}
      size="md"
    >
      {languagesQuery.isPending
        && <Icon path={mdiLoading} spin size={3} className="mx-auto text-panel-text-primary" />}
      {Object.keys(languageDescription).length > 0 && (
        <div className="w-full rounded-lg border border-panel-border bg-panel-input p-4 capitalize">
          <div className="flex h-80 flex-col gap-y-1.5 overflow-y-auto rounded-lg bg-panel-input px-3 py-2">
            {selection?.noneLabel && (
              <Checkbox
                id={NONE_KEY}
                isChecked={languages.length === 0}
                onChange={handleInputChange}
                label={selection.noneLabel}
                justify
              />
            )}
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
      )}
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-5 py-2">Discard</Button>
        <Button
          onClick={handleSave}
          buttonType="primary"
          className="px-5 py-2"
          // An empty image language order is meaningful on the server: TMDB images are
          // downloaded in all languages when the order is empty. Other language orders
          // have no such fallback, so an empty list is invalid there, unless the caller
          // offers an explicit "no language" choice.
          disabled={languages.length === 0 && !allowEmpty}
        >
          Save
        </Button>
      </div>
    </ModalPanel>
  );
};

export default LanguagesModal;
