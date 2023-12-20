import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Input from '@/components/Input/Input';
import TransitionDiv from '@/components/TransitionDiv';
import { useSetDefaultUserMutation } from '@/core/react-query/init/mutations';
import { useDefaultUserQuery } from '@/core/react-query/init/queries';
import { setSaved as setFirstRunSaved, setUser as setUserState } from '@/core/slices/firstrun';

import Footer from './Footer';

import type { TestStatusType } from '@/core/slices/firstrun';

function LocalAccount() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isPending: createUserPending, mutate: createUser } = useSetDefaultUserMutation();
  const defaultUser = useDefaultUserQuery();
  const [user, setUser] = useState({ Username: 'Default', Password: '' });
  const [userStatus, setUserStatus] = useState<TestStatusType>({ type: 'success', text: '' });

  useEffect(() => {
    setUser(defaultUser.data ?? { Username: 'Default', Password: '' });
  }, [defaultUser.data]);

  const handleSave = (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    createUser(user, {
      onSuccess: () => {
        setUserStatus({ type: 'success', text: 'Account Creation Successful!' });
        dispatch(setUserState(user));
        dispatch(setFirstRunSaved('local-account'));
        navigate('../anidb-account');
      },
      onError: (error) => {
        console.error(error);
        setUserStatus({ type: 'error', text: error.message });
      },
    });
  };

  return (
    <TransitionDiv className="flex max-w-[38rem] flex-col justify-center gap-y-8">
      <div className="text-xl font-semibold">Creating Your Account</div>
      <div className="text-justify">
        To use Shoko, you will need to create an account. This account will allow Shoko to manage links to all supported
        metadata sites, enabling the synchronization of watch states and collection statuses.
      </div>
      <form className="flex flex-col" onSubmit={handleSave}>
        <Input
          id="Username"
          value={user.Username}
          label="Username"
          type="text"
          placeholder="Username"
          onChange={e => setUser({ ...user, Username: e.target.value })}
        />
        <Input
          id="Password"
          value={user.Password}
          label="Password"
          type="password"
          placeholder="Password"
          onChange={e => setUser({ ...user, Password: e.target.value })}
          className="mt-9"
        />
        {/* TODO: Add functionality for setting avatar */}
        {/* <Input id="Avatar" value={user.Avatar} label="Avatar" type="text" placeholder="Avatar" onChange={e => dispatch(setUser({ Password: e.target.value }))} className="mt-6" /> */}
        {/* TODO: Display uploaded avatar */}
        <input type="submit" hidden />
      </form>
      <Footer
        nextDisabled={user.Username === ''}
        saveFunction={handleSave}
        isFetching={createUserPending}
        status={userStatus}
      />
    </TransitionDiv>
  );
}

export default LocalAccount;
