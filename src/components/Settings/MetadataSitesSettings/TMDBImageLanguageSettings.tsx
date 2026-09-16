import { useState } from 'react';
import { produce } from 'immer';

import LanguagesModal from '@/components/Dialogs/LanguagesModal';
import LanguageOrderList from '@/components/Settings/LanguageOrderList';

import type { SettingsContextType } from '@/core/types/context';

type Props = Pick<SettingsContextType, 'newSettings' | 'setNewSettings'>;

const TMDBImageLanguageSettings = ({ newSettings, setNewSettings }: Props) => {
  const [showLanguagesModal, setShowLanguagesModal] = useState(false);

  const { ImageLanguageOrder } = newSettings.TMDB;

  const setImageLanguageOrder = (languages: string[]) => {
    setNewSettings(produce(newSettings, (draftState) => {
      draftState.TMDB.ImageLanguageOrder = languages;
    }));
  };

  return (
    <>
      <LanguageOrderList
        label="Image Languages"
        order={ImageLanguageOrder}
        onAddLanguage={() => setShowLanguagesModal(true)}
        onOrderChange={setImageLanguageOrder}
        noLanguageOption
        emptyStateMessage="No image language preference set. Images in all languages will be downloaded."
      />
      <LanguagesModal type={showLanguagesModal ? 'Image' : null} onClose={() => setShowLanguagesModal(false)} />
    </>
  );
};

export default TMDBImageLanguageSettings;
