import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { setUser } from '../../core/slices/firstrun';
import Footer from './Footer';
import Input from '../../components/Input/Input';
import TransitionDiv from '../../components/TransitionDiv';

function LocalAccount() {
  const dispatch = useDispatch();

  const isFetching = useSelector((state: RootState) => state.fetching.firstrunLocalAcc);
  const status = useSelector((state: RootState) => state.firstrun.userStatus);
  const user = useSelector((state: RootState) => state.firstrun.user);

  useEffect(() => {
    dispatch({ type: Events.FIRSTRUN_GET_USER });
  }, []);

  return (
    <TransitionDiv className="flex flex-col flex-grow justify-center">
      <div className="font-bold text-lg">Create Your Account</div>
      <div className="font-mulish mt-5 text-justify">
        In order to use Shoko you&apos;ll need to create an account. This local account will
        allow you to login to Shoko and will link your account with any community site accounts
        provided later on.
      </div>
      <div className="flex flex-col my-8">
        <Input id="Username" value={user.Username} label="Username" type="text" placeholder="Username" onChange={e => dispatch(setUser({ Username: e.target.value }))} />
        <Input id="Password" value={user.Password} label="Password" type="password" placeholder="Password" onChange={e => dispatch(setUser({ Password: e.target.value }))} className="mt-6" />
      </div>
      <Footer
        nextDisabled={user.Username === ''}
        saveFunction={() => dispatch({
          type: Events.FIRSTRUN_SET_USER,
          payload: { Username: user.Username, Password: user.Password },
        })}
        isFetching={isFetching}
        status={status}
      />
    </TransitionDiv>
  );
}

export default LocalAccount;
