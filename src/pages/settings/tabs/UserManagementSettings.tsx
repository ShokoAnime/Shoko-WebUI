import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { cloneDeep, find, isEqual, remove } from 'lodash';
import { useImmer } from 'use-immer';
import { Icon } from '@mdi/react';
import { mdiCircleEditOutline, mdiMagnify, mdiMinusCircleOutline } from '@mdi/js';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import toast from '@/components/Toast';
import { unsetDetails } from '@/core/slices/apiSession';
import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import AvatarEditorModal from '@/components/Settings/AvatarEditorModal';
import type { UserType } from '@/core/types/api/user';

import {
  useGetUsersQuery, usePutUserMutation,
  usePostChangePasswordMutation, useGetCurrentUserQuery,
  useDeleteUserMutation,
} from '@/core/rtkQuery/splitV3Api/userApi';
import {
  useGetPlexAuthenticatedQuery,
  useInvalidatePlexTokenMutation,
  useLazyGetPlexLoginUrlQuery,
} from '@/core/rtkQuery/plexApi';
import { useGetAniDBTagsQuery } from '@/core/rtkQuery/splitV3Api/tagsApi';

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
  Avatar: '',
} as UserType;

function UserManagementSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useGetCurrentUserQuery();
  const usersQuery = useGetUsersQuery();
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery]);
  const [editUser] = usePutUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [changePassword, changePasswordResult] = usePostChangePasswordMutation();
  const [selectedUser, setSelectedUser] = useImmer(initialUser);
  const [newPassword, setNewPassword] = useState('');
  const [logoutOthers, setLogoutOthers] = useState(false);
  const [plexPollingInterval, setPlexPollingInterval] = useState(0);
  const [tagSearch, setTagSearch] = useState('');
  const [avatarFile, setAvatarFile] = useState<File>();
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [getPlexLoginUrl, getPlexLoginUrlResult] = useLazyGetPlexLoginUrlQuery();
  const isPlexAuthenticatedQuery = useGetPlexAuthenticatedQuery(undefined, { pollingInterval: plexPollingInterval });
  const isPlexAuthenticated = isPlexAuthenticatedQuery?.data ?? false;
  const [invalidatePlexToken, invalidatePlexTokenResult] = useInvalidatePlexTokenMutation();
  const tags = useGetAniDBTagsQuery({ pageSize: 0, excludeDescriptions: true });

  useEffect(() => {
    if (users.length > 0) setSelectedUser(users[0]);
  }, [users, setSelectedUser]);

  useEffect(() => {
    if (isEqual(selectedUser, initialUser)) return;
    const user = find(users, tempUser => tempUser.ID === selectedUser.ID);
    if (isEqual(selectedUser, user)) {
      toast.dismiss('unsaved');
    } else {
      toast.info('', 'You have unsaved changes!', {
        autoClose: false,
        draggable: false,
        closeOnClick: false,
        toastId: 'unsaved',
      });
    }
  }, [selectedUser, users]);

  const handleInputChange = (event) => {
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    const tempUser = cloneDeep(selectedUser);
    if (id === 'Trakt' || id === 'AniDB') tempUser.CommunitySites[id] = value;
    else tempUser[id] = value;
    setSelectedUser(tempUser);
  };

  useEffect(() => {
    if (newPassword) {
      toast.info('Password field changed!', 'Click on the "Change" button to save your new password', {
        autoClose: false,
        draggable: false,
        closeOnClick: false,
        toastId: 'password-changed',
      });
    } else {
      toast.dismiss('password-changed');
    }
  }, [newPassword]);

  const handlePasswordChange = () => {
    changePassword({
      Password: newPassword,
      RevokeAPIKeys: logoutOthers,
      ID: selectedUser.ID,
    }).unwrap().then(() => {
      setNewPassword('');
      if (currentUser.data?.ID === selectedUser.ID && logoutOthers) {
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

  const openAvatarModal = (event: React.ChangeEvent<HTMLInputElement>) => {
    const avatar = event.target.files?.[0];
    // eslint-disable-next-line no-param-reassign
    event.target.value = ''; // This is a hack (yes, another) to make the onChange trigger even when same file is selected
    if (!avatar) return;
    setAvatarFile(avatar);
    setShowAvatarModal(true);
  };

  const changeAvatar = useCallback((avatar: string) => {
    setSelectedUser((immerState) => {
      immerState.Avatar = avatar;
    });
  }, [setSelectedUser]);

  const removeAvatar = useCallback(() => {
    // Setting the avatar to an empty string will tell the server to remove the avatar.
    setSelectedUser((immerState) => {
      immerState.Avatar = '';
    });
  }, [setSelectedUser]);

  const deleteSelectedUser = (user: UserType) => {
    if (currentUser.data?.ID === user.ID) {
      toast.error('Woah there buddy!', 'You just tried to delete yourself from the matrix. That\'s not the way to go about doing it.');
    } else {
      deleteUser(user.ID)
        .catch(error => console.error(error));
    }
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

  const renderPlexLink = () => {
    if (isPlexAuthenticated) {
      return <Button onClick={() => invalidatePlexToken()} loading={invalidatePlexTokenResult.isLoading} loadingSize={0.65} className="bg-panel-danger text-xs w-16 font-semibold h-8">Unlink</Button>;
    }
    return getPlexLoginUrlResult?.data ? (
      <Button onClick={() => handlePlexLogin()} loading={plexPollingInterval !== 0} loadingSize={0.65} className="bg-panel-primary text-xs w-24 h-8">Login</Button>
    ) : (
      <Button onClick={() => getPlexLoginUrl()} loading={getPlexLoginUrlResult.isLoading} loadingSize={0.65} className="bg-panel-primary text-xs w-24 h-8">Authenticate</Button>
    );
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
      <div className="font-semibold text-xl">User Management</div>

      <div className="flex flex-col">
        <div className="font-semibold mb-4">Current Users</div>
        <div className="flex flex-col gap-y-3">
          {users.map(user => (
            <div className="flex justify-between" key={`user-${user.ID}`}>
              <div>{user.Username}</div>
              <div className="flex gap-x-2">
                <div onClick={() => setSelectedUser(user)}>
                  <Icon path={mdiCircleEditOutline} size={1} className="cursor-pointer text-panel-primary" />
                </div>
                <div onClick={() => deleteSelectedUser(user)}>
                  <Icon path={mdiMinusCircleOutline} size={1} className="cursor-pointer text-panel-danger" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="font-semibold mb-4">User Options</div>
        <div className="flex flex-col gap-y-3">
          <div className="flex justify-between h-8">
            <div className="mx-0 my-auto">Display Name</div>
            <InputSmall id="Username" value={selectedUser.Username} type="text" onChange={handleInputChange} className="w-32 px-2" />
          </div>
          <div className="flex justify-between h-8">
            <div className="mx-0 my-auto">Plex User Link</div>
            {renderPlexLink()}
          </div>
          <Checkbox justify label="Administrator" id="IsAdmin" isChecked={selectedUser.IsAdmin} onChange={handleInputChange} className="h-8" />
          <Checkbox justify label="AniDB User" id="AniDB" isChecked={selectedUser.CommunitySites?.AniDB} onChange={handleInputChange} className="h-8" />
          <Checkbox justify label="Trakt User" id="Trakt" isChecked={selectedUser.CommunitySites?.Trakt} onChange={handleInputChange} className="h-8" />
          <div className="flex items-center justify-between">
            Change Avatar
            <div className="flex gap-x-2">
              <label htmlFor="avatar" className="px-3 py-2 bg-panel-background border border-panel-border rounded-md text-xs drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] cursor-pointer font-semibold">
                Pick
                <input
                  type="file"
                  id="avatar"
                  onChange={event => openAvatarModal(event)}
                  className="hidden"
                  accept="image/*"
                />
              </label>
              {selectedUser.Avatar && (
                <Button onClick={removeAvatar} className="bg-panel-danger font-semibold px-3 py-2 border border-panel-border text-xs">
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex justify-between h-8 mb-4">
          <div className="font-semibold mx-0 my-auto">Password</div>
          <Button onClick={() => handlePasswordChange()} loading={changePasswordResult.isLoading} disabled={newPassword === ''} className="!text-panel-primary font-semibold !text-base">Change</Button>
        </div>
        <div className="flex flex-col gap-y-3">
          <div className="flex justify-between h-8">
            <div className="mx-0 my-auto">New Password</div>
            <InputSmall id="new-password" value={newPassword} type="password" onChange={event => setNewPassword(event.target.value)} className="w-32 px-2 py-0.5" autoComplete="new-password" />
          </div>
          <div className="h-8">
            <Checkbox justify label="Logout all sessions" id="logout-all" isChecked={logoutOthers} onChange={event => setLogoutOthers(event.target.checked)} className="justify-between" />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="font-semibold mb-4">Tag Restrictions</div>
        <Input type="text" placeholder="Search..." className="bg-panel-background-alt-2" startIcon={mdiMagnify} id="search" value={tagSearch} onChange={event => setTagSearch(event.target.value)} />
        <div className="bg-panel-background-alt overflow-y-scroll h-64 mt-2 rounded-md p-4 capitalize">
          {tags.data?.filter(tag => tag.Name.includes(tagSearch)).map(tag => (
            <div className="first:mt-0 mt-2 cursor-pointer" key={`tagData-${tag.ID}`} onClick={() => handleTagChange(tag.ID, true)}>
              {tag.Name}
            </div>
          ))}
        </div>
        <div className="font-semibold my-4">Selected Tags</div>
        <div className="flex flex-col bg-panel-background-alt rounded-md p-4 min-h-[8rem] ">
          {selectedUser.RestrictedTags?.length
            ? selectedUser.RestrictedTags?.map(tag => (
              <div className="flex justify-between first:mt-0 mt-2 capitalize" key={`selectedTag-${tag}`}>
                {tags.data?.find(tagData => tagData.ID === tag)?.Name ?? 'Unknown'}
                <Button onClick={() => handleTagChange(tag, false)}>
                  <Icon path={mdiMinusCircleOutline} size={1} className="text-panel-danger" />
                </Button>
              </div>
            ))
            : (
              <div className="flex grow justify-center items-center font-semibold">No Restricted Tags!</div>
            )}
        </div>
      </div>

      <div className="flex max-w-[34rem] mt-10 justify-end font-semibold">
        <Button onClick={() => handleCancel()} className="bg-panel-background px-3 py-2 border border-panel-border text-panel-text">Cancel</Button>
        <Button onClick={() => editUser(selectedUser)} className="bg-panel-primary px-3 py-2 ml-3 border border-panel-border">Save</Button>
      </div>

      <AvatarEditorModal show={showAvatarModal} onClose={() => setShowAvatarModal(false)} image={avatarFile} changeAvatar={changeAvatar} />
    </>
  );
}

export default UserManagementSettings;
