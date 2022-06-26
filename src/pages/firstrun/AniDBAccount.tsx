import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import Input from '../../components/Input/Input';
import Footer from './Footer';
import TransitionDiv from '../../components/TransitionDiv';
import { unsetSaved as unsetFirstRunSaved, setAnidbStatus } from '../../core/slices/firstrun';

function AniDBAccount() {
  const dispatch = useDispatch();

  const aniDBSettings = useSelector((state: RootState) => state.localSettings.AniDb);
  const isFetching = useSelector((state: RootState) => state.fetching.firstrunAnidb);
  const status = useSelector((state: RootState) => state.firstrun.anidbStatus);

  const [Username, setUsername] = useState('');
  const [Password, setPassword] = useState('');

  useEffect(() => {
    setUsername(aniDBSettings.Username);
    setPassword(aniDBSettings.Password);
  }, []);

  useEffect(() => {
    dispatch(setAnidbStatus({ type: 'success', text: '' }));
    dispatch(unsetFirstRunSaved('anidb-account'));
  }, [Username, Password]);

  return (
    <TransitionDiv className="flex flex-col justify-center px-96">
      <div className="font-semibold text-lg">Adding Your AniDB Account</div>
      <div className="font-rubik font-semibold mt-10 text-justify">
        Shoko uses AniDB to compare your file hashes with its extensive database to quickly
        figure out and add series to your collection. AniDB also provides additional series
        and episode information that enhances your usage.
      </div>
      <div className="font-rubik font-semibold mt-6 text-justify">
        An AniDB account is required to use Shoko. <a href="https://anidb.net/" target="_blank" rel="noreferrer" className="text-highlight-1 hover:underline">Click Here</a> to create one.
      </div>
      <div className="flex flex-col my-8">
        <Input id="Username" value={Username} label="Username" type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
        <Input id="Password" value={Password} label="Password" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} className="mt-6" />
      </div>
      <Footer nextDisabled={Username === '' || Password === ''} saveFunction={() => dispatch({ type: Events.FIRSTRUN_TEST_ANIDB, payload: { Username, Password } })} isFetching={isFetching} status={status} />
    </TransitionDiv>
  );
}

export default AniDBAccount;
