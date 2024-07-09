import React, { memo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
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

const OptionButton = memo(
  (
    { icon, onClick, tooltip }: { icon: string, onClick: React.MouseEventHandler<HTMLDivElement>, tooltip?: string },
  ) => <IconButton icon={icon} buttonType="secondary" buttonSize="normal" onClick={onClick} tooltip={tooltip} />,
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
            <OptionButton onClick={toggleFilterSidebar} icon={mdiFilterOutline} tooltip="Filter" />
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
