import React, { useEffect, useMemo, useState } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { keys, map, remove } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery, useSupportedLanguagesQuery } from '@/core/react-query/settings/queries';
import useEventCallback from '@/hooks/useEventCallback';

type Props = {
  type: 'Series' | 'Episode' | 'Description' | null;
  onClose: () => void;
};

const LanguagesModal = ({ onClose, type }: Props) => {
  const settings = useSettingsQuery().data;

  const languagesQuery = useSupportedLanguagesQuery();
  const languageDescription = useMemo(() => languagesQuery.data ?? {}, [languagesQuery.data]);

  const LanguagePreference = useMemo(
    () => {
      switch (type) {
        case 'Episode':
          return settings.Language.EpisodeTitleLanguageOrder;
        case 'Description':
          return settings.Language.DescriptionLanguageOrder;
        default:
          return settings.Language.SeriesTitleLanguageOrder;
      }
    },
    [type, settings],
  );
  const { mutate: patchSettings } = usePatchSettingsMutation();

  const [languages, setLanguages] = useState([] as string[]);

  const handleSave = useEventCallback(() => {
    let preferenceType = 'SeriesTitleLanguageOrder';
    if (type === 'Episode') {
      preferenceType = 'EpisodeTitleLanguageOrder';
    } else if (type === 'Description') {
      preferenceType = 'DescriptionLanguageOrder';
    }

    patchSettings({
      newSettings: {
        ...settings,
        Language: {
          ...settings.Language,
          [preferenceType]: languages,
        },
      },
    }, {
      onSuccess: onClose,
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
        <Button onClick={handleSave} buttonType="primary" className="px-5 py-2" disabled={languages.length === 0}>
          Save
        </Button>
      </div>
    </ModalPanel>
  );
};

export default LanguagesModal;
