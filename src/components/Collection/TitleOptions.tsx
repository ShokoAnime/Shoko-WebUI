import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useParams } from 'react-router';
import {
  mdiCogOutline,
  mdiFilterMenuOutline,
  mdiFilterOutline,
  mdiFormatListText,
  mdiMagnify,
  mdiViewGridOutline,
} from '@mdi/js';
import { useToggle } from 'usehooks-ts';

import DisplaySettingsModal from '@/components/Collection/DisplaySettingsModal';
import FilterPresetsModal from '@/components/Dialogs/FilterPresetsModal';
import IconButton from '@/components/Input/IconButton';
import Input from '@/components/Input/Input';

type Props = {
  isSeries: boolean;
  groupSearch: string;
  mode: string;
  seriesSearch: string;
  setSearch: Dispatch<SetStateAction<string>>;
  toggleFilterSidebar: () => void;
  toggleMode: () => void;
};

const OptionButton = React.memo(
  (
    { disabled, icon, onClick, tooltip }: {
      disabled?: boolean;
      icon: string;
      onClick: React.MouseEventHandler<HTMLDivElement>;
      tooltip?: string;
    },
  ) => (
    <IconButton
      disabled={disabled}
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
    mode,
    seriesSearch,
    setSearch,
    toggleFilterSidebar,
    toggleMode,
  } = props;

  const { filterId } = useParams();

  const [showFilterModal, toggleFilterModal] = useToggle(false);
  const [showDisplaySettingsModal, toggleDisplaySettingsModal] = useToggle(false);

  return (
    <>
      <div className="flex gap-x-2">
        <Input
          id="search"
          type="text"
          placeholder="Search..."
          startIcon={mdiMagnify}
          value={isSeries ? seriesSearch : groupSearch}
          onChange={e => setSearch(e.target.value)}
        />
        {!isSeries && (
          <>
            <OptionButton onClick={toggleFilterModal} icon={mdiFilterMenuOutline} tooltip="Filter Presets" />
            <OptionButton
              onClick={toggleFilterSidebar}
              icon={mdiFilterOutline}
              tooltip={!filterId ? 'Filter' : ''}
              disabled={!!filterId}
            />
          </>
        )}
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
