import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import TransitionDiv from '@/components/TransitionDiv';
import { setSaved as setFirstRunSaved } from '@/core/slices/firstrun';

import { useFirstRunSettingsContext } from './FirstRunPage';
import Footer from './Footer';
import AniDBTab from './MetadataSourcesTabs/AniDBTab';
import MovieDBTab from './MetadataSourcesTabs/MovieDBTab';
import TvDBTab from './MetadataSourcesTabs/TvDBTab';

import type { TestStatusType } from '@/core/slices/firstrun';

function MetadataSources() {
  const { saveSettings } = useFirstRunSettingsContext();

  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('anidb');
  const [status, setStatus] = useState<TestStatusType>({ type: 'success', text: '' });

  const renderTabButton = (title: string, key: string) => (
    <Button
      onClick={() => setActiveTab(key)}
      className={cx([
        'font-semibold',
        '!text-lg',
        'drop-shadow-none',
        activeTab === key ? '!text-panel-primary' : '!text-panel-text',
      ])}
    >
      {title}
    </Button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'anidb':
        return <AniDBTab setStatus={setStatus} />;
      case 'tvdb':
        return <TvDBTab />;
      case 'moviedb':
        return <MovieDBTab />;
      default:
        return <AniDBTab setStatus={setStatus} />;
    }
  };

  const handleSave = async () => {
    await saveSettings();
    dispatch(setFirstRunSaved('metadata-sources'));
  };

  return (
    <TransitionDiv className="flex max-w-[38rem] flex-col justify-center gap-y-8 overflow-y-auto">
      <div className="text-xl font-semibold">Metadata Sites</div>
      <div className="text-justify">
        Shoko offers support for various community sites that provide additional metadata for the series in your
        collection. We highly recommend that you review the settings for each site and configure them to meet your
        preferences.
      </div>
      <div className="flex gap-x-2 border-b-2 border-panel-border pb-3 text-xl">
        {renderTabButton('AniDB', 'anidb')}
        |
        {renderTabButton('TMBD', 'moviedb')}
        |
        {renderTabButton('TVDB', 'tvdb')}
        {/* TODO: Add plex and trakt settings. Currently they only work after the setup is completed. */}
      </div>
      <div className="flex h-80 shrink flex-col overflow-y-auto pr-8">
        {renderTabContent()}
      </div>
      <Footer nextPage="start-server" saveFunction={handleSave} status={status} />
    </TransitionDiv>
  );
}

export default MetadataSources;
