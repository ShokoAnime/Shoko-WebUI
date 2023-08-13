import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Input from '@/components/Input/Input';
import TransitionDiv from '@/components/TransitionDiv';
import { usePostAniDBTestLoginMutation } from '@/core/rtkQuery/splitV3Api/settingsApi';
import { setSaved as setFirstRunSaved, unsetSaved as unsetFirstRunSaved } from '@/core/slices/firstrun';

import { useFirstRunSettingsContext } from './FirstRunPage';
import Footer from './Footer';

import type { TestStatusType } from '@/core/slices/firstrun';

function AniDBAccount() {
  const {
    newSettings,
    saveSettings,
    updateSetting,
  } = useFirstRunSettingsContext();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [testAniDbLogin, testAniDbLoginResult] = usePostAniDBTestLoginMutation();
  const [anidbStatus, setAnidbStatus] = useState<TestStatusType>({ type: 'success', text: '' });

  const { Password, Username } = newSettings.AniDb;

  const handleInputChange = (event: any) => {
    const { id, value } = event.target;
    updateSetting('AniDb', id, value);
    setAnidbStatus({ type: 'success', text: '' });
    dispatch(unsetFirstRunSaved('anidb-account'));
  };

  const handleTest = (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    testAniDbLogin({ Username, Password }).unwrap().then(async () => {
      setAnidbStatus({ type: 'success', text: 'AniDB Test Successful!' });
      await saveSettings();
      dispatch(setFirstRunSaved('anidb-account'));
      navigate('../metadata-sources');
    }, (error) => {
      console.error(error);
      setAnidbStatus({ type: 'error', text: error.data });
    });
  };

  return (
    <TransitionDiv className="flex max-w-[38rem] flex-col justify-center gap-y-8">
      <div className="text-xl font-semibold">Adding Your AniDB Account</div>
      <div className="text-justify">
        Shoko utilizes AniDB to compare file hashes with its vast database, enabling a quick identification and addition
        of series to your collection. Additionally, AniDB provides supplementary information about series and episodes,
        enhancing your user experience.
      </div>
      <div className="text-justify">
        An AniDB account is required to use Shoko. If you don&lsquo;t already have an account,
        <a
          href="https://anidb.net/"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-panel-primary hover:underline"
        >
          {' Click Here '}
        </a>
        to create one. Please note that, due to limitations with AniDB&lsquo;s API, your password must consist of only
        <span className="font-semibold text-panel-important">{' alphanumeric '}</span>
        characters. Using any other characters will result in a ban when you attempt to log in.
      </div>
      <form className="flex flex-col" onSubmit={handleTest}>
        <Input
          id="Username"
          value={Username ?? ''}
          label="Username"
          type="text"
          placeholder="Username"
          onChange={handleInputChange}
        />
        <Input
          id="Password"
          value={Password ?? ''}
          label="Password"
          type="password"
          placeholder="Password"
          onChange={handleInputChange}
          className="mt-9"
        />
        <input type="submit" hidden />
      </form>
      <Footer
        nextDisabled={!Username || !Password}
        saveFunction={handleTest}
        isFetching={testAniDbLoginResult.isLoading}
        status={anidbStatus}
      />
    </TransitionDiv>
  );
}

export default AniDBAccount;
