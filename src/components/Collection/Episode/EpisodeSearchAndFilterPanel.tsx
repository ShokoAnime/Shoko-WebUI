import React from 'react';
import { mdiInformationOutline, mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';

import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import ShokoPanel from '@/components/Panels/ShokoPanel';

type Props = {
  episodeFilterType: string;
  episodeFilterAvailability: string;
  episodeFilterWatched: string;
  episodeFilterHidden: string;
  search: string;
  hasUnaired: boolean;
  hasMissing: boolean;
  onFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const EpisodeSearchAndFilterPanel = ({
  episodeFilterAvailability,
  episodeFilterHidden,
  episodeFilterType,
  episodeFilterWatched,
  hasMissing,
  hasUnaired,
  onFilterChange,
  onSearchChange,
  search,
}: Props) => (
  <div className="flex flex-col gap-y-6">
    <ShokoPanel
      title="Search & Filter"
      className="w-400"
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
        onChange={onSearchChange}
      />

      <Select
        id="episodeType"
        label="Type"
        value={episodeFilterType}
        onChange={onFilterChange}
      >
        <option value="">All</option>
        <option value="Normal">Episodes</option>
        <option value="Special">Specials</option>
        <option value="Other">Others</option>
        <option value="ThemeSong,OpeningSong,EndingSong">Credits</option>
        <option value="Unknown,Trailer,Parody,Interview,Extra">Misc.</option>
      </Select>

      <Select
        id="status"
        label="Episode Status"
        value={episodeFilterAvailability}
        onChange={onFilterChange}
      >
        <option value="true">All Episodes</option>
        <option value="false">Available Episodes</option>
        <option value="only">Missing Episodes</option>
      </Select>

      <Select
        id="watched"
        label="Watched State"
        value={episodeFilterWatched}
        onChange={onFilterChange}
      >
        <option value="true">All</option>
        <option value="only">Watched</option>
        <option value="false">Unwatched</option>
      </Select>

      <Select
        id="hidden"
        label="Hidden Status"
        value={episodeFilterHidden}
        onChange={onFilterChange}
      >
        <option value="true">Show All Entries</option>
        <option value="false">Hide Hidden Entries</option>
        <option value="only">Show Only Hidden Entries</option>
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

export default EpisodeSearchAndFilterPanel;
