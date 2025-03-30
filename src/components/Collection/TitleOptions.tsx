import React from 'react';
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
          placeholder="Search..."
          startIcon={mdiMagnify}
          value={isSeries ? seriesSearch : groupSearch}
          onChange={setSearch}
        />
        {!isSeries && <OptionButton onClick={toggleFilterModal} icon={mdiFilterMenuOutline} tooltip="Filter Presets" />}
        {isSeries && <OptionButton onClick={editGroupModalCallback} icon={mdiPencil} tooltip="Edit Group" />}
        <OptionButton onClick={toggleFilterSidebar} icon={mdiFilterOutline} tooltip="Filter" />
        <OptionButton
          onClick={toggleMode}
          icon={mode === 'poster' ? mdiFormatListText : mdiViewGridOutline}
          tooltip={`Switch to ${mode === 'poster' ? 'list' : 'poster'} mode`}
        />
        <OptionButton onClick={toggleDisplaySettingsModal} icon={mdiCogOutline} tooltip="Display Settings" />
      </div>
      <FilterPresetsModal show={showFilterModal} onClose={toggleFilterModal} />
      <DisplaySettingsModal show={showDisplaySettingsModal} onClose={toggleDisplaySettingsModal} />
    </>
  );
};

export default TitleOptions;
