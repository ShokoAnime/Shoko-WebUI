import React, { useState } from 'react';
import cx from 'classnames';
import { map } from 'lodash';

import Action from '@/components/Collection/Series/EditSeriesTabs/Action';
import ModalPanel from '@/components/Panels/ModalPanel';

type Props =
  & {
    show: boolean;
    onRequestClose: () => void;
  }
  & SeriesEpisodesTabProps
  & FilteredEpisodesTabProps;

const tabs = {
  filtered_episodes: 'Selected Episodes',
  series_episodes: 'All Episodes',
};

type SeriesEpisodesTabProps = {
  markSeriesWatched: () => void;
  markSeriesUnwatched: () => void;
};
const SeriesEpisodesTab = React.memo(({ markSeriesUnwatched, markSeriesWatched }: SeriesEpisodesTabProps) => (
  <>
    <Action
      name="Mark as watched"
      description="Mark all the episodes in this series as watched."
      onClick={markSeriesWatched}
    />
    <Action
      name="Mark as unwatched"
      description="Mark all the episodes in this series as unwatched."
      onClick={markSeriesUnwatched}
    />
  </>
));

type FilteredEpisodesTabProps = {
  markFilteredWatched: () => void;
  markFilteredUnwatched: () => void;
};
const FilteredEpisodesTab = React.memo(({ markFilteredUnwatched, markFilteredWatched }: FilteredEpisodesTabProps) => (
  <>
    <Action
      name="Mark as watched"
      description="Mark all the episodes in this filtered selection as watched."
      onClick={markFilteredWatched}
    />
    <Action
      name="Mark as unwatched"
      description="Mark all the episodes in this filtered selection as unwatched."
      onClick={markFilteredUnwatched}
    />
  </>
));

const renderTab = (
  activeTab: string,
  markSeriesWatched: () => void,
  markSeriesUnwatched: () => void,
  markFilteredWatched: () => void,
  markFilteredUnwatched: () => void,
) => {
  switch (activeTab) {
    case 'series_episodes':
      return <SeriesEpisodesTab markSeriesUnwatched={markSeriesWatched} markSeriesWatched={markSeriesUnwatched} />;
    case 'filtered_episodes':
    default:
      return (
        <FilteredEpisodesTab markFilteredWatched={markFilteredWatched} markFilteredUnwatched={markFilteredUnwatched} />
      );
  }
};

const EpisodeWatchModal = (
  { markFilteredUnwatched, markFilteredWatched, markSeriesUnwatched, markSeriesWatched, onRequestClose, show }: Props,
) => {
  const [activeTab, setActiveTab] = useState('series_episodes');

  return (
    <ModalPanel
      show={show}
      onRequestClose={onRequestClose}
      header="Watch options"
      size="md"
      noPadding
      noGap
    >
      <div className="flex h-[22rem] flex-row gap-x-6 p-6">
        <div className="flex shrink-0 gap-y-6 font-semibold">
          <div className="flex flex-col gap-y-1">
            {map(tabs, (value, key) => (
              <div
                className={cx(
                  activeTab === key
                    ? 'w-[12rem] text-center bg-panel-menu-item-background p-3 rounded-lg text-panel-menu-item-text cursor-pointer'
                    : 'w-[12rem] text-center p-3 rounded-lg hover:bg-panel-menu-item-background-hover cursor-pointer',
                )}
                key={key}
                onClick={() => setActiveTab(key)}
              >
                {value}
              </div>
            ))}
          </div>
        </div>
        <div className="border-r border-panel-border" />
        <div className="grow">
          <div className="flex h-[22rem] grow flex-col gap-y-4 overflow-y-auto">
            {renderTab(activeTab, markSeriesWatched, markSeriesUnwatched, markFilteredWatched, markFilteredUnwatched)}
          </div>
        </div>
      </div>
    </ModalPanel>
  );
};

export default EpisodeWatchModal;
