import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { cloneDeep, find, isEqual, remove } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiCircleEditOutline, mdiMagnify, mdiMinusCircleOutline } from '@mdi/js';

import ShokoPanel from '../../../components/Panels/ShokoPanel';
import Checkbox from '../../../components/Input/Checkbox';
import InputSmall from '../../../components/Input/InputSmall';
import toast from '../../../components/Toast';
import { unsetDetails } from '../../../core/slices/apiSession';
import Button from '../../../components/Input/Button';
import Input from '../../../components/Input/Input';
import type { UserType } from '../../../core/types/api/user';

import {
  useGetUsersQuery,
  usePostChangePasswordMutation,
  usePutUserMutation,
} from '../../../core/rtkQuery/splitV3Api/userApi';
import {
  useGetPlexAuthenticatedQuery,
  useInvalidatePlexTokenMutation,
  useLazyGetPlexLoginUrlQuery,
} from '../../../core/rtkQuery/plexApi';
import { useGetAniDBTagsQuery } from '../../../core/rtkQuery/splitV3Api/tagsApi';

const initialUser = {
  ID: 0,
  Username: '',
  IsAdmin: true,
  RestrictedTags: [],
  CommunitySites: {
    AniDB: true,
    Trakt: false,
    Plex: false,
  },
} as UserType;

function UserManagementSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const usersQuery = useGetUsersQuery();
  const users = usersQuery.data ?? [];
  const [editUser] = usePutUserMutation();
  const [changePassword, changePasswordResult] = usePostChangePasswordMutation();

  const [selectedUser, setSelectedUser] = useState(initialUser);
  const [newPassword, setNewPassword] = useState('');
  const [logoutOthers, setLogoutOthers] = useState(false);
  const [plexPollingInterval, setPlexPollingInterval] = useState(0);
  const [tagSearch, setTagSearch] = useState('');

  const [getPlexLoginUrl, getPlexLoginUrlResult] = useLazyGetPlexLoginUrlQuery();
  const isPlexAuthenticatedQuery = useGetPlexAuthenticatedQuery(undefined, { pollingInterval: plexPollingInterval });
  const isPlexAuthenticated = isPlexAuthenticatedQuery?.data ?? false;
  const [invalidatePlexToken, invalidatePlexTokenResult] = useInvalidatePlexTokenMutation();
  const tags = useGetAniDBTagsQuery({ pageSize: 0, excludeDescriptions: true });

  useEffect(() => {
    if (users.length > 0) setSelectedUser(users[0]);
  }, [users]);

  useEffect(() => {
    if (isEqual(selectedUser, initialUser)) return;
    if (isEqual(selectedUser, find(users, user => user.ID === selectedUser.ID)))
      toast.dismiss('unsaved');
    else {
      toast.info('', 'You have unsaved changes!', {
        autoClose: false,
        draggable: false,
        closeOnClick: false,
        toastId: 'unsaved',
      });
    }
  }, [selectedUser]);

  const handleInputChange = (event) => {
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    const tempUser = cloneDeep(selectedUser);
    if (id === 'Trakt') tempUser.CommunitySites[id] = value;
    else tempUser[id] = value;
    setSelectedUser(tempUser);
  };

  useEffect(() => {
    if (newPassword)
      toast.info('Password field changed!', 'Click on the "Change" button to save your new password', {
        autoClose: false,
        draggable: false,
        closeOnClick: false,
        toastId: 'password-changed',
      });
    else {
      toast.dismiss('password-changed');
    }
  }, [newPassword]);

  const handlePasswordChange = () => {
    changePassword({ Password: newPassword, RevokeAPIKeys: logoutOthers, userId: selectedUser.ID, admin: selectedUser.IsAdmin }).unwrap().then(() => {
      setNewPassword('');
      if (logoutOthers) {
        toast.success('Password changed successfully!', 'You will be logged out in 5 seconds!', { autoClose: 5000 });
        setTimeout(() => {
          dispatch(unsetDetails());
          navigate('/webui/login');
        }, 6000);
      } else toast.success('Password changed successfully!');
    }, error => console.error(error));
  };

  const handleCancel = () => {
    setNewPassword('');
    setLogoutOthers(false);
    setSelectedUser(find(users, user => user.ID === selectedUser.ID)!);
  };

  const handlePlexLogin = () => {
    window.open(getPlexLoginUrlResult?.data, '_blank');
    setPlexPollingInterval(1000);
    toast.info('Checking plex login status!', '', {
      autoClose: false,
      draggable: false,
      closeOnClick: false,
      toastId: 'plex-status',
    });
  };

  useEffect(() => {
    if (isPlexAuthenticated) {
      setPlexPollingInterval(0);
      toast.dismiss('plex-status');
    }
  }, [isPlexAuthenticated]);

  const handleTagChange = (tagId: number, selected: boolean) => {
    const tempUser = cloneDeep(selectedUser);
    if (selected && !tempUser.RestrictedTags.find(tag => tag === tagId)) {
      tempUser.RestrictedTags.push(tagId);
      tempUser.RestrictedTags = tempUser.RestrictedTags.sort((tagA, tagB) => {
        const tagAName = tags.data?.find(tag => tag.ID === tagA)?.Name!;
        const tagBName = tags.data?.find(tag => tag.ID === tagB)?.Name!;
        return tagAName.localeCompare(tagBName);
      });
    }
    if (!selected) remove(tempUser.RestrictedTags, tag => tag === tagId);
    setSelectedUser(tempUser);
  };

  return (
    <>
      <ShokoPanel title="Current Users" isFetching={usersQuery.isLoading}>
        {users.map(user => (
          <div className="flex justify-between mt-3 first:mt-0" key={`user-${user.ID}`}>
            <div>{user.Username}</div>
            <div className="flex cursor-pointer">
              <div onClick={() => setSelectedUser(user)}>
                <Icon path={mdiCircleEditOutline} size={1} className="text-highlight-1 mr-2" />
              </div>
              <Icon path={mdiMinusCircleOutline} size={1} className="text-highlight-3" />
            </div>
          </div>
        ))}
      </ShokoPanel>

      <ShokoPanel title="Options" isFetching={usersQuery.isLoading} className="mt-8">
        <div className="flex justify-between">
          Display Name
          <InputSmall id="Username" value={selectedUser.Username} type="text" onChange={handleInputChange} className="w-32 px-2 py-0.5" />
        </div>
        <div className="flex justify-between mt-2">
          Plex User Link
          {isPlexAuthenticated ? (
            <Button onClick={() => invalidatePlexToken()} loading={invalidatePlexTokenResult.isLoading} loadingSize={0.65} className="bg-highlight-3 py-1 text-xs w-16">Unlink</Button>
          ) : getPlexLoginUrlResult?.data ? (
            <Button onClick={() => handlePlexLogin()} loading={plexPollingInterval !== 0} loadingSize={0.65} className="bg-highlight-1 py-1 text-xs w-24">Login</Button>
          ) : (
            <Button onClick={() => getPlexLoginUrl()} loading={getPlexLoginUrlResult.isLoading} loadingSize={0.65} className="bg-highlight-1 py-1 text-xs w-24">Authenticate</Button>
          )}
        </div>
        <Checkbox justify label="Administrator" id="IsAdmin" isChecked={selectedUser.IsAdmin} onChange={handleInputChange} className="mt-2" />
        <Checkbox justify label="Trakt User" id="Trakt" isChecked={selectedUser.CommunitySites?.Trakt} onChange={handleInputChange} className="mt-2" />
      </ShokoPanel>

      <ShokoPanel
        title="Password"
        className="mt-8"
        options={<Button onClick={() => handlePasswordChange()} loading={changePasswordResult.isLoading} disabled={newPassword === ''} className="!text-highlight-1 font-semibold !text-base">Change</Button>}
      >
        <div className="flex justify-between">
          New Password
          <InputSmall id="new-password" value={newPassword} type="password" onChange={event => setNewPassword(event.target.value)} className="w-32 px-2 py-0.5" autoComplete="new-password" />
        </div>
        <Checkbox justify label="Logout all sessions" id="logout-all" isChecked={logoutOthers} onChange={event => setLogoutOthers(event.target.checked)} className="mt-2" />
      </ShokoPanel>

      <ShokoPanel title="Tag Restrictions" isFetching={usersQuery.isFetching && tags.isFetching} className="mt-8">
        <div className="flex flex-col bg-background-alt border border-background-border rounded-md mt-2 px-3 py-2">
          <Input type="text" placeholder="Search..." className="bg-background-nav" startIcon={mdiMagnify} id="search" value={tagSearch} onChange={event => setTagSearch(event.target.value)} />
          <div className="flex flex-col overflow-y-auto h-64 mt-2">
            {tags.data?.filter(tag => tag.Name.includes(tagSearch)).map(tag => (
              <div className="first:mt-0 mt-2 cursor-pointer" key={`tagData-${tag.ID}`} onClick={() => handleTagChange(tag.ID, true)}>
                {tag.Name}
              </div>
            ))}
          </div>
        </div>
        <div className="font-semibold mt-3">Selected Tags</div>
        <div className="flex flex-col bg-background-alt border border-background-border rounded-md mt-2 px-3 py-2 min-h-[8rem]">
          {selectedUser.RestrictedTags?.length
            ? selectedUser.RestrictedTags?.map(tag => (
              <div className="flex justify-between first:mt-0 mt-2" key={`selectedTag-${tag}`}>
                {tags.data?.find(tagData => tagData.ID === tag)?.Name ?? 'Unknown'}
                <Button onClick={() => handleTagChange(tag, false)}>
                  <Icon path={mdiMinusCircleOutline} size={1} className="text-highlight-3" />
                </Button>
              </div>
            ))
            : (
              <div className="flex grow justify-center items-center font-semibold">No restricted tags!</div>
            )
          }
        </div>
      </ShokoPanel>

      <div className="flex max-w-[34rem] mt-10 justify-end">
        <Button onClick={() => handleCancel()} className="bg-background-alt px-3 py-2 border border-background-border">Cancel</Button>
        <Button onClick={() => editUser(selectedUser)} className="bg-highlight-1 px-3 py-2 ml-3 border border-background-border">Save</Button>
      </div>
    </>
  );
}

export default UserManagementSettings;
