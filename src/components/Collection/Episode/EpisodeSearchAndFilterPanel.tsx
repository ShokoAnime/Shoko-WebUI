import React from 'react';
import { mdiInformationOutline, mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';

import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import ShokoPanel from '@/components/Panels/ShokoPanel';

type Props = {
  type: string;
  availability: string;
  watched: string;
  hidden: string;
  search: string;
  unaired: string;
  hasUnaired: boolean;
  hasMissing: boolean;
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

const EpisodeSearchAndFilterPanel = React.memo((props: Props) => {
  const {
    availability,
    hasMissing,
    hasUnaired,
    hidden,
    onFilterChange,
    search,
    type,
    unaired,
    watched,
  } = props;

  return (
    <div className="flex flex-col gap-y-6">
      <ShokoPanel
        title="Search & Filter"
        className="w-100"
        contentClassName="gap-y-6"
        fullHeight={false}
        sticky
        transparent
      >
        <Input
          inputClassName=""
          id="search"
          label="Episode Search"
          startIcon={mdiMagnify}
          type="text"
          placeholder="Search..."
          value={search}
          onChange={onFilterChange}
        />

        <Select
          id="type"
          label="Type"
          value={type}
          onChange={onFilterChange}
        >
          <option value="">All</option>
          <option value="Normal">Episodes</option>
          <option value="Special">Specials</option>
          <option value="Other">Others</option>
          <option value="ThemeSong">Credits</option>
          <option value="Unknown,Trailer,Parody,Extra">Misc.</option>
        </Select>

        <Select
          id="includeMissing"
          label="Episode Status"
          value={availability}
          onChange={onFilterChange}
        >
          <option value="true">All Episodes</option>
          <option value="false">Available Episodes</option>
          <option value="only">Missing Episodes</option>
        </Select>

        <Select
          id="includeWatched"
          label="Watched State"
          value={watched}
          onChange={onFilterChange}
        >
          <option value="true">All</option>
          <option value="only">Watched</option>
          <option value="false">Unwatched</option>
        </Select>

        <Select
          id="includeHidden"
          label="Hidden Status"
          value={hidden}
          onChange={onFilterChange}
        >
          <option value="true">Show All Entries</option>
          <option value="false">Hide Hidden Entries</option>
          <option value="only">Show Only Hidden Entries</option>
        </Select>

        <Select
          id="includeUnaired"
          label="Air Status"
          value={unaired}
          onChange={onFilterChange}
        >
          <option value="true">All</option>
          <option value="only">Unaired</option>
          <option value="false">Aired</option>
        </Select>

        {(hasUnaired || hasMissing) && <hr className="border border-panel-border" />}
        <div className="flex flex-col gap-y-3">
          {hasUnaired && (
            <div className="flex flex-row gap-x-3">
              <Icon path={mdiInformationOutline} className="text-panel-icon-warning" size={1} />
              <div className="grow text-base font-semibold">
                Series has Unaired Episodes
              </div>
            </div>
          )}
          {hasMissing && (
            <div className="flex flex-row gap-x-3">
              <Icon path={mdiInformationOutline} className="text-panel-icon-warning" size={1} />
              <div className="grow text-base font-semibold">
                Series has Missing Episodes
              </div>
            </div>
          )}
        </div>
      </ShokoPanel>
    </div>
  );
});

export default EpisodeSearchAndFilterPanel;
