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
import { Icon } from '@mdi/react';
import { useToggle } from 'usehooks-ts';

import DisplaySettingsModal from '@/components/Collection/DisplaySettingsModal';
import FiltersModal from '@/components/Dialogs/FiltersModal';
import Input from '@/components/Input/Input';

type Props = {
  isSeries: boolean;
  groupSearch: string;
  mode: string;
  seriesSearch: string;
  setGroupSearch: Dispatch<SetStateAction<string>>;
  setSeriesSearch: Dispatch<SetStateAction<string>>;
  toggleFilterSidebar: () => void;
  toggleMode: () => void;
};

const OptionButton = memo(
  ({ icon, onClick }: { icon: string, onClick: React.MouseEventHandler<HTMLDivElement> }) => (
    <div
      className="cursor-pointer rounded border border-panel-border bg-button-secondary px-5 py-2 drop-shadow-md"
      onClick={onClick}
    >
      <Icon path={icon} size={1} />
    </div>
  ),
);

const TitleOptions = (props: Props) => {
  const {
    groupSearch,
    isSeries,
    mode,
    seriesSearch,
    setGroupSearch,
    setSeriesSearch,
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
          onChange={e => (isSeries ? setSeriesSearch(e.target.value) : setGroupSearch(e.target.value))}
        />
        {!isSeries && (
          <>
            <OptionButton onClick={toggleFilterModal} icon={mdiFilterMenuOutline} />
            <OptionButton onClick={toggleFilterSidebar} icon={mdiFilterOutline} />
          </>
        )}
        <OptionButton onClick={toggleMode} icon={mode === 'poster' ? mdiFormatListText : mdiViewGridOutline} />
        <OptionButton onClick={toggleDisplaySettingsModal} icon={mdiCogOutline} />
      </div>
      <FiltersModal show={showFilterModal} onClose={toggleFilterModal} />
      <DisplaySettingsModal show={showDisplaySettingsModal} onClose={toggleDisplaySettingsModal} />
    </>
  );
};

export default TitleOptions;
