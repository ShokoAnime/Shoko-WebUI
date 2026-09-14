import { useState } from 'react';
import { mdiChevronRight } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import TransitionDiv from '@/components/TransitionDiv';
import { setSaved as setFirstRunSaved } from '@/core/slices/firstrun';
import { useDispatch } from '@/core/store';
import useFirstRunSettingsContext from '@/hooks/useFirstRunSettingsContext';

import Footer from './Footer';
import AniDBTab from './MetadataSourcesTabs/AniDBTab';
import AnilistTab from './MetadataSourcesTabs/AnilistTab';
import TMDBTab from './MetadataSourcesTabs/TMDBTab';

const TabButton = (
  { active, setActiveTab, tabKey, title }: {
    active: boolean;
    setActiveTab: (tab: string) => void;
    tabKey: string;
    title: string;
  },
) => {
  const handleClick = () => {
    setActiveTab(tabKey);
  };

  return (
    <Button
      onClick={handleClick}
      className={cx(
        'border-none! bg-transparent! text-xl font-semibold drop-shadow-none',
        active ? 'text-panel-text-primary' : 'text-panel-text!',
      )}
    >
      {title}
    </Button>
  );
};

const TabContent = ({ tab }: { tab: string }) => {
  switch (tab) {
    case 'anidb':
      return <AniDBTab />;
    case 'moviedb':
      return <TMDBTab />;
    case 'anilist':
      return <AnilistTab />;
    default:
      return <AniDBTab />;
  }
};

const MetadataSources = () => {
  const { saveSettings } = useFirstRunSettingsContext();

  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('anidb');

  const handleSave = () => {
    saveSettings()
      .then(() => dispatch(setFirstRunSaved('metadata-sources')))
      .catch(console.error);
  };

  return (
    <>
      <title>First Run &gt; Metadata Sources | Shoko</title>
      <TransitionDiv className="flex max-w-152 flex-col justify-center gap-y-6 overflow-y-auto">
        <div className="text-xl font-semibold">Metadata Sites</div>
        <div className="text-justify">
          Shoko offers support for various community sites that provide additional metadata for the series in your
          collection. We highly recommend that you review the settings for each site and configure them to meet your
          preferences.
        </div>
        <div className="flex items-center gap-x-2 pb-3 text-xl font-semibold">
          <div>Recently Imported</div>
          <Icon path={mdiChevronRight} size={1} />
          <TabButton
            active={activeTab === 'anidb'}
            setActiveTab={setActiveTab}
            tabKey="anidb"
            title="AniDB"
          />
          |
          <TabButton
            active={activeTab === 'moviedb'}
            setActiveTab={setActiveTab}
            tabKey="moviedb"
            title="TMDB"
          />
          |
          <TabButton
            active={activeTab === 'anilist'}
            setActiveTab={setActiveTab}
            tabKey="anilist"
            title="AniList"
          />
        </div>
        <div className="flex h-80 shrink flex-col overflow-y-auto pr-8">
          <TabContent tab={activeTab} />
        </div>
        <Footer
          nextPage="start-server"
          saveFunction={handleSave}
        />
      </TransitionDiv>
    </>
  );
};

export default MetadataSources;
