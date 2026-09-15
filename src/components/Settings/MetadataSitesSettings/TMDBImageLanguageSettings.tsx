import { useState } from 'react';
import { mdiLoading, mdiMinusCircleOutline, mdiPlusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { produce } from 'immer';

import LanguagesModal from '@/components/Dialogs/LanguagesModal';
import DnDList from '@/components/DnDList/DnDList';
import Button from '@/components/Input/Button';
import { addNoLanguageOption } from '@/core/react-query/settings/helpers';
import { useSupportedLanguagesQuery } from '@/core/react-query/settings/queries';

import type { SettingsContextType } from '@/core/types/context';
import type { DropResult } from '@hello-pangea/dnd';

type Props = Pick<SettingsContextType, 'newSettings' | 'setNewSettings'>;

const TMDBImageLanguageSettings = ({ newSettings, setNewSettings }: Props) => {
  const [showLanguagesModal, setShowLanguagesModal] = useState(false);

  const languagesQuery = useSupportedLanguagesQuery();
  const languageDescription = addNoLanguageOption(languagesQuery.data ?? {});

  const { ImageLanguageOrder } = newSettings.TMDB;

  const setImageLanguageOrder = (languages: string[]) => {
    setNewSettings(produce(newSettings, (draftState) => {
      draftState.TMDB.ImageLanguageOrder = languages;
    }));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;

    const items = [...ImageLanguageOrder];
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    setImageLanguageOrder(items);
  };

  const removeLanguage = (language: string) => {
    setImageLanguageOrder(ImageLanguageOrder.filter(item => item !== language));
  };

  if (languagesQuery.isPending) {
    return <Icon path={mdiLoading} spin size={3} className="mx-auto text-panel-text-primary" />;
  }

  return (
    <>
      <div className="flex justify-between">
        Image Languages (Drag to Reorder)
        <Button onClick={() => setShowLanguagesModal(true)} tooltip="Add Language">
          <Icon className="text-panel-icon-action" path={mdiPlusCircleOutline} size={1} />
        </Button>
      </div>
      <div className="mt-2 flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
        {ImageLanguageOrder.length > 0
          ? (
            <DnDList onDragEnd={onDragEnd}>
              {ImageLanguageOrder.map(language => (
                {
                  key: language,
                  item: (
                    <div className="mt-2 flex items-center justify-between group-first:mt-0">
                      {languageDescription[language] ?? language}
                      <Button onClick={() => removeLanguage(language)} tooltip="Remove">
                        <Icon className="text-panel-icon-action" path={mdiMinusCircleOutline} size={1} />
                      </Button>
                    </div>
                  ),
                }
              ))}
            </DnDList>
          )
          : <div>Image preference not set. Downloading all languages.</div>}
      </div>
      <LanguagesModal type={showLanguagesModal ? 'Image' : null} onClose={() => setShowLanguagesModal(false)} />
    </>
  );
};

export default TMDBImageLanguageSettings;
