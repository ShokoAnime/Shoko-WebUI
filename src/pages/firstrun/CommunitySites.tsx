import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import cx from 'classnames';

import { setSaved as setFirstRunSaved } from '../../core/slices/firstrun';
import Footer from './Footer';
import Button from '../../components/Input/Button';
import AniDBTab from './CommunitySiteTabs/AniDBTab';
import TvDBTab from './CommunitySiteTabs/TvDBTab';
import MovieDBTab from './CommunitySiteTabs/MovieDBTab';
import TransitionDiv from '../../components/TransitionDiv';

function CommunitySites() {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('anidb');

  const renderTabButton = (title: string, key: string) => (
    <Button onClick={() => setActiveTab(key)} className={cx(['mr-6 font-bold', activeTab === key && 'color-highlight-1'])}>
      {title}
    </Button>
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
    <TransitionDiv className="flex flex-col flex-grow overflow-y-auto justify-center">
      <div className="font-bold text-lg">Community Sites</div>
      <div className="font-mulish mt-5 text-justify">
        Shoko supports multiple community sites that can be used to download additional
        metadata for the series in your collection. We highly recommend going through each
        sites settings and configuring them to your liking.
      </div>
      <div className="flex mt-5 border-b pb-4">
        {renderTabButton('AniDB', 'anidb')}
        {renderTabButton('The TvDB', 'tvdb')}
        {renderTabButton('The Movie DB', 'moviedb')}
      </div>
      <div className="flex flex-col mt-4 mb-8 overflow-y-auto flex-shrink">
        {renderTabContent()}
      </div>
      <Footer nextPage="start-server" saveFunction={() => dispatch(setFirstRunSaved('community-sites'))} />
    </TransitionDiv>
  );
}

export default CommunitySites;
