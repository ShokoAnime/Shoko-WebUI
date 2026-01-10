import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';

import Action from '@/components/Collection/Series/EditSeriesTabs/Action';
import ModalPanel from '@/components/Panels/ModalPanel';

type FilteredEpisodesTabProps = {
  markFilteredWatched: () => void;
  markFilteredUnwatched: () => void;
  translate: (key: string) => string;
};

type Props = {
  show: boolean;
  onRequestClose: () => void;
  markFilteredWatched: () => void;
  markFilteredUnwatched: () => void;
};

const tabKeys = [
  'filtered_episodes',
  // TODO: Add support for selected episodes
  // 'selected_episodes',
] as const;

const FilteredEpisodesTab = React.memo((
  { markFilteredUnwatched, markFilteredWatched, translate }: FilteredEpisodesTabProps,
) => (
  <div className="flex flex-col gap-y-4">
    <Action
      name={translate('watchModal.actions.markWatched')}
      description={translate('watchModal.actions.markWatchedDesc')}
      onClick={markFilteredWatched}
    />
    <Action
      name={translate('watchModal.actions.markUnwatched')}
      description={translate('watchModal.actions.markUnwatchedDesc')}
      onClick={markFilteredUnwatched}
    />
  </div>
));

const renderTab = (
  activeTab: string,
  markFilteredWatched: () => void,
  markFilteredUnwatched: () => void,
  translate: (key: string) => string,
) => {
  switch (activeTab) {
    case 'selected_episodes':
      return <>{translate('watchModal.notImplemented')}</>;
    case 'filtered_episodes':
    default:
      return (
        <FilteredEpisodesTab
          markFilteredWatched={markFilteredWatched}
          markFilteredUnwatched={markFilteredUnwatched}
          translate={translate}
        />
      );
  }
};

const EpisodeWatchModal = (
  { markFilteredUnwatched, markFilteredWatched, onRequestClose, show }: Props,
) => {
  const { t: translate } = useTranslation('series');
  const [activeTab, setActiveTab] = useState('filtered_episodes');

  return (
    <ModalPanel
      show={show}
      onRequestClose={onRequestClose}
      header={translate('watchModal.title')}
      size="md"
      noPadding
      noGap
    >
      <div className="flex flex-row gap-x-6 p-6">
        <div className="flex shrink-0 gap-y-6 font-semibold">
          <div className="flex flex-col gap-y-1">
            {tabKeys.map(key => (
              <div
                className={cx(
                  activeTab === key
                    ? 'w-[12rem] text-center bg-panel-menu-item-background p-3 rounded-lg text-panel-menu-item-text cursor-pointer'
                    : 'w-[12rem] text-center p-3 rounded-lg hover:bg-panel-menu-item-background-hover cursor-pointer',
                )}
                key={key}
                onClick={() => setActiveTab(key)}
              >
                {translate(`watchModal.tabs.${key}`)}
              </div>
            ))}
          </div>
        </div>
        <div className="border-r border-panel-border" />
        <div className="grow">
          <div className="flex h-[22rem] grow flex-col gap-y-4 overflow-y-auto">
            {renderTab(activeTab, markFilteredWatched, markFilteredUnwatched, translate)}
          </div>
        </div>
      </div>
    </ModalPanel>
  );
};

export default EpisodeWatchModal;
