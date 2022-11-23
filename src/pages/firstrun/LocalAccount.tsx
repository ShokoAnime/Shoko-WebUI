import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from '@lagunovsky/redux-react-router';

import Footer from './Footer';
import Input from '../../components/Input/Input';
import TransitionDiv from '../../components/TransitionDiv';
import { TestStatusType, setSaved as setFirstRunSaved, setUser as setUserState } from '../../core/slices/firstrun';

import { useGetInitDefaultUserQuery, usePostInitDefaultUserMutation } from '../../core/rtkQuery/splitV3Api/initApi';

function LocalAccount() {
  const dispatch = useDispatch();

  const [createUser, createUserResult] = usePostInitDefaultUserMutation();
  const defaultUser = useGetInitDefaultUserQuery();
  const [user, setUser] = useState({ Username: 'Default', Password: '' });
  const [userStatus, setUserStatus] = useState<TestStatusType>({ type: 'success', text: '' });

  useEffect(() => {
    setUser(defaultUser.data ?? { Username: 'Default', Password: '' });
  }, [defaultUser.data]);

  const handleSave = () => {
    createUser(user).unwrap().then(() => {
      setUserStatus({ type: 'success', text: 'Account creation successful!' });
      dispatch(setUserState(user));
      dispatch(setFirstRunSaved('local-account'));
      dispatch(push('anidb-account'));
    }, (error) => {
      console.error(error);
      setUserStatus({ type: 'error', text: error.data });
    });
  };

  return (
    <TransitionDiv className="flex flex-col justify-center max-w-[40rem] px-8">
      <div className="font-semibold">Create Your Account</div>
      <div className="mt-9 text-justify">
        In order to use Shoko you&apos;ll need to create an account. This local account will
        allow you to login to Shoko and will link your account with any community site accounts
        provided later on.
      </div>
      <div className="flex flex-col my-9">
        <Input id="Username" value={user.Username} label="Username" type="text" placeholder="Username" onChange={e => setUser({ ...user, Username: e.target.value })} />
        <Input id="Password" value={user.Password} label="Password" type="password" placeholder="Password" onChange={e => setUser({ ...user, Password: e.target.value })} className="mt-9" />
        {/* TODO: Add functionality for setting avatar */}
        {/* <Input id="Avatar" value={user.Avatar} label="Avatar" type="text" placeholder="Avatar" onChange={e => dispatch(setUser({ Password: e.target.value }))} className="mt-6" /> */}
        {/* TODO: Display uploaded avatar */}
      </div>
      <Footer
        nextDisabled={user.Username === ''}
        saveFunction={() => handleSave()}
        isFetching={createUserResult.isLoading}
        status={userStatus}
      />
    </TransitionDiv>
  );
}

export default LocalAccount;
