import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import cx from 'classnames';

import { setSaved as setFirstRunSaved } from '../../core/slices/firstrun';
import Footer from './Footer';
import AniDBTab from './CommunitySiteTabs/AniDBTab';
import TvDBTab from './CommunitySiteTabs/TvDBTab';
import MovieDBTab from './CommunitySiteTabs/MovieDBTab';
import TransitionDiv from '../../components/TransitionDiv';

function CommunitySites() {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('anidb');

  const renderTabButton = (title: string, key: string) => (
    <button onClick={() => setActiveTab(key)} className={cx(['mr-5 font-semibold text-lg', activeTab === key && 'text-highlight-1'])}>
      {title}
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'anidb':
        return (<AniDBTab />);
      case 'tvdb':
        return (<TvDBTab />);
      case 'moviedb':
        return (<MovieDBTab />);
      default:
        return (<AniDBTab />);
    }
  };

  return (
    <TransitionDiv className="flex flex-col overflow-y-auto justify-center px-96">
      <div className="font-semibold text-lg">Community Sites</div>
      <div className="font-rubik font-semibold mt-10 text-justify">
        Shoko supports multiple community sites that can be used to download additional
        metadata for the series in your collection. We highly recommend going through each
        sites settings and configuring them to your liking.
      </div>
      <div className="flex mt-10 border-b border-background-border pb-4">
        {renderTabButton('AniDB', 'anidb')}
        {renderTabButton('The Movie DB', 'moviedb')}
        {renderTabButton('The TvDB', 'tvdb')}
        {/* TODO: Add plex and trakt settings. Currently they only work after the setup is completed. */}
      </div>
      <div className="flex flex-col mt-5 mb-8 overflow-y-auto flex-shrink">
        {renderTabContent()}
      </div>
      <Footer nextPage="start-server" saveFunction={() => dispatch(setFirstRunSaved('community-sites'))} />
    </TransitionDiv>
  );
}

export default CommunitySites;
