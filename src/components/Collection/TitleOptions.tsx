import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  mdiCogOutline,
  mdiFilterMenuOutline,
  mdiFilterOutline,
  mdiFormatListText,
  mdiMagnify,
  mdiPencil,
  mdiViewGridOutline,
} from '@mdi/js';
import { useToggle } from 'usehooks-ts';

import DisplaySettingsModal from '@/components/Collection/DisplaySettingsModal';
import FilterPresetsModal from '@/components/Dialogs/FilterPresetsModal';
import IconButton from '@/components/Input/IconButton';
import Input from '@/components/Input/Input';
import useEditGroupCallback from '@/hooks/collection/useEditGroupCallback';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

type Props = {
  groupSearch: string;
  isSeries: boolean;
  item: CollectionGroupType | SeriesType;
  mode: string;
  seriesSearch: string;
  setSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  toggleFilterSidebar: () => void;
  toggleMode: () => void;
};

const OptionButton = React.memo(
  (
    { icon, onClick, tooltip }: {
      icon: string;
      onClick: React.MouseEventHandler<HTMLDivElement>;
      tooltip?: string;
    },
  ) => (
    <IconButton
      icon={icon}
      buttonType="secondary"
      buttonSize="normal"
      onClick={onClick}
      tooltip={tooltip}
    />
  ),
);

const TitleOptions = (props: Props) => {
  const { t } = useTranslation('collection');
  const {
    groupSearch,
    isSeries,
    item,
    mode,
    seriesSearch,
    setSearch,
    toggleFilterSidebar,
    toggleMode,
  } = props;

  const [showFilterModal, toggleFilterModal] = useToggle(false);
  const [showDisplaySettingsModal, toggleDisplaySettingsModal] = useToggle(false);
  const editGroupModalCallback = useEditGroupCallback(item);

  return (
    <>
      <div className="flex gap-x-2">
        <Input
          id="search"
          type="text"
          placeholder={t('search.placeholder')}
          startIcon={mdiMagnify}
          value={isSeries ? seriesSearch : groupSearch}
          onChange={setSearch}
        />
        {!isSeries && (
          <OptionButton onClick={toggleFilterModal} icon={mdiFilterMenuOutline} tooltip={t('actions.filterPresets')} />
        )}
        {isSeries && (
          <OptionButton
            onClick={editGroupModalCallback}
            icon={mdiPencil}
            tooltip={t('actions.editGroup')}
          />
        )}
        <OptionButton onClick={toggleFilterSidebar} icon={mdiFilterOutline} tooltip={t('actions.filter')} />
        <OptionButton
          onClick={toggleMode}
          icon={mode === 'poster' ? mdiFormatListText : mdiViewGridOutline}
          tooltip={t('actions.switchMode', {
            mode: mode === 'poster'
              ? t('modes.list')
              : t('modes.poster'),
          })}
        />
        <OptionButton
          onClick={toggleDisplaySettingsModal}
          icon={mdiCogOutline}
          tooltip={t('actions.displaySettings')}
        />
      </div>
      <FilterPresetsModal show={showFilterModal} onClose={toggleFilterModal} />
      <DisplaySettingsModal show={showDisplaySettingsModal} onClose={toggleDisplaySettingsModal} />
    </>
  );
};

export default TitleOptions;
