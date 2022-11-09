import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import cx from 'classnames';

import { setSaved as setFirstRunSaved, TestStatusType } from '../../core/slices/firstrun';
import Footer from './Footer';
import AniDBTab from './MetadataSourcesTabs/AniDBTab';
import TvDBTab from './MetadataSourcesTabs/TvDBTab';
import MovieDBTab from './MetadataSourcesTabs/MovieDBTab';
import TransitionDiv from '../../components/TransitionDiv';

import { useFirstRunSettingsContext } from './FirstRunPage';

function MetadataSources() {
  const { saveSettings } = useFirstRunSettingsContext();

  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('anidb');
  const [status, setStatus] = useState<TestStatusType>({ type: 'success', text: '' });

  const renderTabButton = (title: string, key: string) => (
    <button onClick={() => setActiveTab(key)} className={cx(['mr-3 font-semibold', activeTab === key && 'text-highlight-1'])}>
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
    <TransitionDiv className="flex flex-col overflow-y-auto justify-center max-w-[40rem] px-8 py-36">
      <div className="font-semibold">Metadata Sources</div>
      <div className="mt-9 text-justify">
        Shoko supports multiple community sites that can be used to download additional
        metadata for the series in your collection. We highly recommend going through each
        sites settings and configuring them to your liking.
      </div>
      <div className="flex mt-9 border-b-2 border-background-border pb-3">
        {renderTabButton('AniDB', 'anidb')}
        {renderTabButton('TMBD', 'moviedb')}
        {renderTabButton('TVDB', 'tvdb')}
        {/* TODO: Add plex and trakt settings. Currently they only work after the setup is completed. */}
      </div>
      <div className="flex flex-col mt-2 mb-3 p-2.5 h-full overflow-y-auto flex-shrink">
        {renderTabContent()}
      </div>
      <Footer nextPage="start-server" saveFunction={() => handleSave()} status={status} />
    </TransitionDiv>
  );
}

export default MetadataSources;
