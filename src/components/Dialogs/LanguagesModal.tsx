import type { ChangeEvent } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { keys, map, remove } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import { addNoLanguageOption } from '@/core/react-query/settings/helpers';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery, useSupportedLanguagesQuery } from '@/core/react-query/settings/queries';
import useSyncedState from '@/hooks/useSyncedState';

import type { SettingsType } from '@/core/types/api/settings';

type Props = {
  type: 'Series' | 'Episode' | 'Description' | 'Image' | null;
  onClose: () => void;
};

const getLanguagePreference = (type: Props['type'], settings: SettingsType) => {
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

const LanguagesModal = ({ onClose, type }: Props) => {
  const settings = useSettingsQuery().data;

  const languagesQuery = useSupportedLanguagesQuery();
  const languageDescription = type === 'Image'
    ? addNoLanguageOption(languagesQuery.data ?? {})
    : languagesQuery.data ?? {};

  const LanguagePreference = getLanguagePreference(type, settings);
  const { mutate: patchSettings } = usePatchSettingsMutation();

  const [languages, setLanguages] = useSyncedState<string[] | null, string[]>(
    type !== null ? LanguagePreference : null,
    source => source ?? [],
  );

  const handleSave = () => {
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
      size="md"
    >
      {languagesQuery.isPending
        && <Icon path={mdiLoading} spin size={3} className="mx-auto text-panel-text-primary" />}
      {Object.keys(languageDescription).length > 0 && (
        <div className="w-full rounded-lg border border-panel-border bg-panel-input p-4 capitalize">
          <div className="flex h-80 flex-col gap-y-1.5 overflow-y-auto rounded-lg bg-panel-input px-3 py-2">
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
          // have no such fallback, so an empty list is invalid there.
          disabled={languages.length === 0 && type !== 'Image'}
        >
          Save
        </Button>
      </div>
    </ModalPanel>
  );
};

export default LanguagesModal;
