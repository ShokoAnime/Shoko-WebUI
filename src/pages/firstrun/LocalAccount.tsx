import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import Input from '@/components/Input/Input';
import TransitionDiv from '@/components/TransitionDiv';
import { useSetDefaultUserMutation } from '@/core/react-query/init/mutations';
import { useDefaultUserQuery } from '@/core/react-query/init/queries';
import { setSaved as setFirstRunSaved, setUser as setUserState } from '@/core/slices/firstrun';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import Footer from './Footer';

import type { TestStatusType } from '@/core/slices/firstrun';

const LocalAccount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigateVoid();

  const { isPending: createUserPending, mutate: createUser } = useSetDefaultUserMutation();
  const defaultUserQuery = useDefaultUserQuery();
  const [user, setUser] = useState({ Username: 'Default', Password: '' });
  const [userStatus, setUserStatus] = useState<TestStatusType>({ type: 'success', text: '' });

  useEffect(() => {
    setUser(defaultUserQuery.data ?? { Username: 'Default', Password: '' });
  }, [defaultUserQuery.data]);

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
    <>
      <title>First Run &gt; Local Account | Shoko</title>
      <TransitionDiv className="flex max-w-[38rem] flex-col justify-center gap-y-6">
        <div className="text-xl font-semibold">Creating Your Account</div>
        <div className="text-justify">
          To use Shoko, you will need to create an account. This account will allow Shoko to manage links to all
          supported metadata sites, enabling the synchronization of watch states and collection statuses.
        </div>
        <form className="flex flex-col" onSubmit={handleSave}>
          <Input
            id="Username"
            value={user.Username}
            label="Username"
            type="text"
            placeholder="Username"
            onChange={event => setUser({ ...user, Username: event.target.value })}
          />
          <Input
            id="Password"
            value={user.Password}
            label="Password"
            type="password"
            placeholder="Password"
            onChange={event => setUser({ ...user, Password: event.target.value })}
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
    </>
  );
};

export default LocalAccount;
