import React, { useState } from 'react';
import cx from 'classnames';
import { map } from 'lodash';

import Action from '@/components/Collection/Series/EditSeriesTabs/Action';
import ModalPanel from '@/components/Panels/ModalPanel';

type FilteredEpisodesTabProps = {
  markFilteredWatched: () => void;
  markFilteredUnwatched: () => void;
};

type Props =
  & {
    show: boolean;
    onRequestClose: () => void;
  }
  & FilteredEpisodesTabProps;

const tabs = {
  filtered_episodes: 'Filtered Episodes',
};

const FilteredEpisodesTab = React.memo(({ markFilteredUnwatched, markFilteredWatched }: FilteredEpisodesTabProps) => (
  <>
    <Action
      name="Mark as watched"
      description="Mark as watched episodes matching the current search & filter options."
      onClick={markFilteredWatched}
    />
    <Action
      name="Mark as unwatched"
      description="Mark as unwatched episodes matching the current search & filter options."
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
            {renderTab(activeTab, markFilteredWatched, markFilteredUnwatched)}
          </div>
        </div>
      </div>
    </ModalPanel>
  );
};

export default EpisodeWatchModal;
