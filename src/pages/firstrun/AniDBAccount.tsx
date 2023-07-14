import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Input from '@/components/Input/Input';
import TransitionDiv from '@/components/TransitionDiv';

import {
  setSaved as setFirstRunSaved,
  TestStatusType,
  unsetSaved as unsetFirstRunSaved,
} from '@/core/slices/firstrun';
import { usePostAniDBTestLoginMutation } from '@/core/rtkQuery/splitV3Api/settingsApi';
import { useFirstRunSettingsContext } from './FirstRunPage';
import Footer from './Footer';

function AniDBAccount() {
  const {
    newSettings, saveSettings, updateSetting,
  } = useFirstRunSettingsContext();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [testAniDbLogin, testAniDbLoginResult] = usePostAniDBTestLoginMutation();
  const [anidbStatus, setAnidbStatus] = useState<TestStatusType>({ type: 'success', text: '' });

  const { Username, Password } = newSettings.AniDb;

  const handleInputChange = (event: any) => {
    const { id, value } = event.target;
    updateSetting('AniDb', id, value);
    setAnidbStatus({ type: 'success', text: '' });
    dispatch(unsetFirstRunSaved('anidb-account'));
  };

  const handleTest = (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    testAniDbLogin({ Username, Password }).unwrap().then(async () => {
      setAnidbStatus({ type: 'success', text: 'AniDB test successful!' });
      await saveSettings();
      dispatch(setFirstRunSaved('anidb-account'));
      navigate('../metadata-sources');
    }, (error) => {
      console.error(error);
      setAnidbStatus({ type: 'error', text: error.data });
    });
  };

  return (
    <TransitionDiv className="flex flex-col justify-center max-w-[38rem] gap-y-8">
      <div className="font-semibold text-xl">Adding Your AniDB Account</div>
      <div className="text-justify">
        Shoko utilizes AniDB to compare file hashes with its vast database, enabling a quick identification and addition
        of series to your collection. Additionally, AniDB provides supplementary information about series and episodes,
        enhancing your user experience.
      </div>
      <div className="text-justify">
        An AniDB account is required to use Shoko. If you don't already have an account,
        <a href="https://anidb.net/" target="_blank" rel="noreferrer" className="text-highlight-1 hover:underline font-semibold">
          {` Click Here `}
        </a>
        to create one. Please note that, due to limitations with AniDB's API, your password must consist of only
        <span className='font-semibold text-highlight-2'>{` alphanumeric `}</span>
        characters. Using any other characters will result in a ban when you attempt to log in.
      </div>
      <div className="text-justify">

      </div>
      <form className="flex flex-col" onSubmit={handleTest}>
        <Input id="Username" value={Username ?? ''} label="Username" type="text" placeholder="Username" onChange={handleInputChange} />
        <Input id="Password" value={Password ?? ''} label="Password" type="password" placeholder="Password" onChange={handleInputChange} className="mt-9" />
        <input type="submit" hidden />
      </form>
      <Footer nextDisabled={!Username || !Password} saveFunction={handleTest} isFetching={testAniDbLoginResult.isLoading} status={anidbStatus} />
    </TransitionDiv>
  );
}

export default AniDBAccount;
