import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import cx from 'classnames';

import { setSaved as setFirstRunSaved, TestStatusType } from '@/core/slices/firstrun';
import Footer from './Footer';
import AniDBTab from './MetadataSourcesTabs/AniDBTab';
import TvDBTab from './MetadataSourcesTabs/TvDBTab';
import MovieDBTab from './MetadataSourcesTabs/MovieDBTab';
import TransitionDiv from '@/components/TransitionDiv';

import { useFirstRunSettingsContext } from './FirstRunPage';

function MetadataSources() {
  const { saveSettings } = useFirstRunSettingsContext();

  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('anidb');
  const [status, setStatus] = useState<TestStatusType>({ type: 'success', text: '' });

  const renderTabButton = (title: string, key: string) => (
    <button onClick={() => setActiveTab(key)} className={cx(['font-semibold', activeTab === key && 'text-highlight-1'])}>
      {title}
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'anidb':
        return (<AniDBTab setStatus={setStatus} />);
      case 'tvdb':
        return (<TvDBTab />);
      case 'moviedb':
        return (<MovieDBTab />);
      default:
        return (<AniDBTab setStatus={setStatus} />);
    }
  };

  const handleSave = async () => {
    await saveSettings();
    dispatch(setFirstRunSaved('metadata-sources'));
  };

  return (
    <TransitionDiv className="flex flex-col overflow-y-auto justify-center max-w-[38rem] gap-y-8">
      <div className="font-semibold text-xl">Metadata Sites</div>
      <div className="text-justify">
        Shoko offers support for various community sites that provide additional metadata for the series in your
        collection. We highly recommend that you review the settings for each site and configure them to meet your
        preferences.
      </div>
      <div className="flex border-b-2 border-background-border pb-3 gap-x-2 text-xl">
        {renderTabButton('AniDB', 'anidb')}
        |
        {renderTabButton('TMBD', 'moviedb')}
        |
        {renderTabButton('TVDB', 'tvdb')}
        {/* TODO: Add plex and trakt settings. Currently they only work after the setup is completed. */}
      </div>
      <div className="flex flex-col pr-8 overflow-y-auto flex-shrink h-80">
        {renderTabContent()}
      </div>
      <Footer nextPage="start-server" saveFunction={handleSave} status={status} />
    </TransitionDiv>
  );
}

export default MetadataSources;
