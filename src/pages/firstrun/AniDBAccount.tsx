import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from '@lagunovsky/redux-react-router';

import Input from '../../components/Input/Input';
import Footer from './Footer';
import TransitionDiv from '../../components/TransitionDiv';

import { setSaved as setFirstRunSaved, TestStatusType, unsetSaved as unsetFirstRunSaved } from '../../core/slices/firstrun';
import { useFirstRunSettingsContext } from './FirstRunPage';
import { usePostAniDBTestLoginMutation } from '../../core/rtkQuery/settingsApi';

function AniDBAccount() {
  const {
    newSettings, saveSettings, updateSetting,
  } = useFirstRunSettingsContext();

  const dispatch = useDispatch();

  const [testAniDbLogin, testAniDbLoginResult] = usePostAniDBTestLoginMutation();
  const [anidbStatus, setAnidbStatus] = useState<TestStatusType>({ type: 'success', text: '' });

  const { Username, Password } = newSettings.AniDb;

  const handleInputChange = (event: any) => {
    const { id, value } = event.target;
    updateSetting('AniDb', id, value);
    setAnidbStatus({ type: 'success', text: '' });
    dispatch(unsetFirstRunSaved('anidb-account'));
  };

  const handleTest = () => {
    testAniDbLogin({ Username, Password }).unwrap().then(async () => {
      setAnidbStatus({ type: 'success', text: 'AniDB test successful!' });
      await saveSettings();
      dispatch(setFirstRunSaved('anidb-account'));
      dispatch(push('metadata-sources'));
    }, (error) => {
      console.error(error);
      setAnidbStatus({ type: 'error', text: error.data });
    });
  };

  return (
    <TransitionDiv className="flex flex-col justify-center max-w-[40rem] px-8">
      <div className="font-semibold">Adding Your AniDB Account</div>
      <div className="mt-9 text-justify">
        Shoko uses AniDB to compare your file hashes with its extensive database to quickly
        figure out and add series to your collection. AniDB also provides additional series
        and episode information that enhances your usage.
      </div>
      <div className="mt-9 text-justify">
        An AniDB account is required to use Shoko. <a href="https://anidb.net/" target="_blank" rel="noreferrer" className="text-highlight-1 hover:underline">Click Here</a> to create one.
      </div>
      <div className="flex flex-col my-9">
        <Input id="Username" value={Username} label="Username" type="text" placeholder="Username" onChange={handleInputChange} />
        <Input id="Password" value={Password} label="Password" type="password" placeholder="Password" onChange={handleInputChange} className="mt-9" />
      </div>
      <Footer nextDisabled={Username === '' || Password === ''} saveFunction={() => handleTest()} isFetching={testAniDbLoginResult.isLoading} status={anidbStatus} />
    </TransitionDiv>
  );
}

export default AniDBAccount;
