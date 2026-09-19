import type { SubmitEvent } from 'react';

import Input from '@/components/Input/Input';
import TransitionDiv from '@/components/TransitionDiv';
import { useSetDefaultUserMutation } from '@/core/react-query/init/mutations';
import { useDefaultUserQuery } from '@/core/react-query/init/queries';
import { setSaved as setFirstRunSaved, setUser as setUserState } from '@/core/slices/firstrun';
import { useDispatch } from '@/core/store';
import toast from '@/core/toast';
import useNavigateVoid from '@/hooks/useNavigateVoid';
import useSyncedState from '@/hooks/useSyncedState';

import Footer from './Footer';

const DEFAULT_USER = { Username: 'Default', Password: '' };

const LocalAccount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigateVoid();

  const { isPending: createUserPending, mutate: createUser } = useSetDefaultUserMutation();
  const defaultUserQuery = useDefaultUserQuery();
  const [user, setUser] = useSyncedState(defaultUserQuery.data ?? DEFAULT_USER);

  const handleSave = (event?: SubmitEvent) => {
    if (event) event.preventDefault();
    createUser(user, {
      onSuccess: () => {
        toast.success('Account Creation Successful!');
        dispatch(setUserState(user));
        dispatch(setFirstRunSaved('local-account'));
        navigate('../anidb-account');
      },
      onError: (error) => {
        console.error(error);
        toast.error(error.message);
      },
    });
  };

  return (
    <>
      <title>First Run &gt; Local Account | Shoko</title>
      <TransitionDiv className="flex max-w-152 flex-col justify-center gap-y-6">
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
        />
      </TransitionDiv>
    </>
  );
};

export default LocalAccount;
