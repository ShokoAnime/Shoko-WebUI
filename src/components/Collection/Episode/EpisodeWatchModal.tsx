import React, { useState } from 'react';
import cx from 'classnames';
import { map } from 'lodash';

import Action from '@/components/Collection/Series/EditSeriesTabs/Action';
import ModalPanel from '@/components/Panels/ModalPanel';

type FilteredEpisodesTabProps = {
  markFilteredWatched: () => void;
  markFilteredUnwatched: () => void;
};

type Props = {
  show: boolean;
  onRequestClose: () => void;
} & FilteredEpisodesTabProps;

const tabs = {
  filtered_episodes: 'Filtered Episodes',
  // TODO: Add support for selected episodes
  // selected_episodes: 'Selected Episodes',
};

const FilteredEpisodesTab = React.memo(({ markFilteredUnwatched, markFilteredWatched }: FilteredEpisodesTabProps) => (
  <>
    <Action
      name="Mark as watched"
      description="Mark the filtered episodes as watched."
      onClick={markFilteredWatched}
    />
    <Action
      name="Mark as unwatched"
      description="Mark the filtered episodes as unwatched."
      onClick={markFilteredUnwatched}
    />
  </>
));

const renderTab = (
  activeTab: string,
  markFilteredWatched: () => void,
  markFilteredUnwatched: () => void,
) => {
  switch (activeTab) {
    case 'selected_episodes':
      return <>Not yet implemented!</>;
    case 'filtered_episodes':
    default:
      return (
        <FilteredEpisodesTab markFilteredWatched={markFilteredWatched} markFilteredUnwatched={markFilteredUnwatched} />
      );
  }
};

const EpisodeWatchModal = (
  { markFilteredUnwatched, markFilteredWatched, onRequestClose, show }: Props,
) => {
  const [activeTab, setActiveTab] = useState('filtered_episodes');

  return (
    <ModalPanel
      show={show}
      onRequestClose={onRequestClose}
      header="Watch Options"
      size="md"
      noPadding
      noGap
    >
      <div className="flex flex-row gap-x-6 p-6">
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
            {renderTab(activeTab, markFilteredWatched, markFilteredUnwatched)}
          </div>
        </div>
      </div>
    </ModalPanel>
  );
};

export default EpisodeWatchModal;
