import React, { useMemo } from 'react';
import { mdiMagnify } from '@mdi/js';

import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import ShokoPanel from '@/components/Panels/ShokoPanel';

type Props = {
  episodeFilterType: string;
  episodeFilterAvailability: string;
  episodeFilterWatched: string;
  episodeFilterHidden: string;
  search: string;
  onFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const EpisodeSearchAndFilterPanel = ({
  episodeFilterAvailability,
  episodeFilterHidden,
  episodeFilterType,
  episodeFilterWatched,
  onFilterChange,
  onSearchChange,
  search,
}: Props) => {
  const searchInput = useMemo(() => (
    <Input
      inputClassName=""
      id="search"
      label="Title Search"
      startIcon={mdiMagnify}
      type="text"
      placeholder="Search..."
      value={search}
      onChange={onSearchChange}
    />
  ), [onSearchChange, search]);
  const episodeType = useMemo(() => (
    <Select
      id="episodeType"
      label="Episode Type"
      value={episodeFilterType}
      onChange={onFilterChange}
    >
      <option value="">All</option>
      <option value="Normal">Normal</option>
      <option value="Special">Specials</option>
      <option value="Other">Others</option>
      <option value="ThemeSong,OpeningSong,EndingSong">Credits</option>
      <option value="Unknown,Trailer,Parody,Interview,Extra">Misc.</option>
    </Select>
  ), [episodeFilterType, onFilterChange]);
  const availability = useMemo(() => (
    <Select
      id="status"
      label="Availability"
      value={episodeFilterAvailability}
      onChange={onFilterChange}
    >
      <option value="true">All</option>
      <option value="false">Available</option>
      <option value="only">Missing</option>
    </Select>
  ), [episodeFilterAvailability, onFilterChange]);
  const watched = useMemo(() => (
    <Select
      id="watched"
      label="Watched Status"
      value={episodeFilterWatched}
      onChange={onFilterChange}
    >
      <option value="true">All</option>
      <option value="only">Watched</option>
      <option value="false">Unwatched</option>
    </Select>
  ), [episodeFilterWatched, onFilterChange]);
  const hidden = useMemo(() => (
    <Select
      id="hidden"
      label="Hidden Status"
      value={episodeFilterHidden}
      onChange={onFilterChange}
    >
      <option value="true">All</option>
      <option value="false">Not Hidden</option>
      <option value="only">Hidden</option>
    </Select>
  ), [episodeFilterHidden, onFilterChange]);
  return (
    <div className="flex flex-col gap-y-6">
      <ShokoPanel
        title="Search & Filter"
        className="w-400"
        contentClassName="gap-y-6"
        fullHeight={false}
        sticky
        transparent
      >
        {searchInput}
        {episodeType}
        {availability}
        {watched}
        {hidden}
      </ShokoPanel>
    </div>
  );
};

export default EpisodeSearchAndFilterPanel;
