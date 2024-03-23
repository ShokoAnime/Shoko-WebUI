import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { mdiCircleEditOutline, mdiLoading, mdiMagnify, mdiMinusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { cloneDeep, find, isEqual, remove } from 'lodash';
import { useImmer } from 'use-immer';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import InputSmall from '@/components/Input/InputSmall';
import AvatarEditorModal from '@/components/Settings/AvatarEditorModal';
import toast from '@/components/Toast';
import Events from '@/core/events';
import { useAniDBTagsQuery } from '@/core/react-query/tag/queries';
import {
  useChangePasswordMutation,
  useDeleteUserMutation,
  usePutUserMutation,
} from '@/core/react-query/user/mutations';
import { useCurrentUserQuery, useUsersQuery } from '@/core/react-query/user/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { UserType } from '@/core/types/api/user';

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

  const currentUserQuery = useCurrentUserQuery();
  const usersQuery = useUsersQuery();
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const { mutate: editUser } = usePutUserMutation();
  const { mutate: deleteUser } = useDeleteUserMutation();
  const { isPending: isChangePasswordPending, mutate: changePassword } = useChangePasswordMutation();
  const [selectedUser, setSelectedUser] = useImmer(initialUser);
  const [newPassword, setNewPassword] = useState('');
  const [logoutOthers, setLogoutOthers] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [avatarFile, setAvatarFile] = useState<File>();
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const tagsQuery = useAniDBTagsQuery({ pageSize: 0, excludeDescriptions: true });

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    const tempUser = cloneDeep(selectedUser);
    if ((id === 'Trakt' || id === 'AniDB') && typeof value === 'boolean') tempUser.CommunitySites[id] = value;
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
      userId: selectedUser.ID,
    }, {
      onSuccess: () => {
        setNewPassword('');
        if (currentUserQuery.data?.ID === selectedUser.ID && logoutOthers) {
          toast.success('Password changed successfully!', 'You will be logged out in 5 seconds!', { autoClose: 5000 });
          setTimeout(() => {
            dispatch({ type: Events.AUTH_LOGOUT });
          }, 6000);
        } else toast.success('Password changed successfully!');
      },
    });
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

  const changeAvatar = (avatar: string) => {
    setSelectedUser((immerState) => {
      immerState.Avatar = avatar;
    });
  };

  const removeAvatar = useEventCallback(() => {
    // Setting the avatar to an empty string will tell the server to remove the avatar.
    setSelectedUser((immerState) => {
      immerState.Avatar = '';
    });
  });

  const deleteSelectedUser = (user: UserType) => {
    if (currentUserQuery.data?.ID === user.ID) {
      toast.error(
        'Woah there buddy!',
        'You just tried to delete yourself from the matrix. That\'s not the way to go about doing it.',
      );
    } else {
      deleteUser(user.ID);
    }
  };

  const handleTagChange = (tagId: number, selected: boolean) => {
    const tempUser = cloneDeep(selectedUser);
    if (selected && !tempUser.RestrictedTags.find(tag => tag === tagId)) {
      tempUser.RestrictedTags.push(tagId);
      tempUser.RestrictedTags = tempUser.RestrictedTags.sort((tagA, tagB) => {
        const tagAName = tagsQuery.data?.find(tag => tag.ID === tagA)?.Name;
        const tagBName = tagsQuery.data?.find(tag => tag.ID === tagB)?.Name;
        if (tagAName === undefined || tagBName === undefined) return 0;
        return tagAName?.localeCompare(tagBName);
      });
    }
    if (!selected) remove(tempUser.RestrictedTags, tag => tag === tagId);
    setSelectedUser(tempUser);
  };

  return (
    <>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">User Management</div>
        <div>
          ConfigureShoko user accounts by changing usernames, passwords, avatars, and specifying which tags a user is
          restricted from viewing.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex h-[2.149rem] items-center font-semibold">Current Users</div>
        <div className="flex flex-col gap-y-1">
          {users.map(user => (
            <div className="flex justify-between" key={`user-${user.ID}`}>
              <div>{user.Username}</div>
              <div className="flex gap-x-2">
                <div onClick={() => setSelectedUser(user)}>
                  <Icon path={mdiCircleEditOutline} size={1} className="cursor-pointer text-panel-icon-action" />
                </div>
                <div onClick={() => deleteSelectedUser(user)}>
                  <Icon path={mdiMinusCircleOutline} size={1} className="cursor-pointer text-panel-icon-danger" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex h-[2.149rem] items-center font-semibold">User Options</div>
        <div className="flex flex-col gap-y-1">
          <div className="flex h-8 justify-between">
            <div className="mx-0 my-auto">Display Name</div>
            <InputSmall
              id="Username"
              value={selectedUser.Username}
              type="text"
              onChange={handleInputChange}
              className="w-36 px-3 py-1"
            />
          </div>
          <Checkbox
            justify
            label="Administrator"
            id="IsAdmin"
            isChecked={selectedUser.IsAdmin}
            onChange={handleInputChange}
            className="h-8"
          />
          <Checkbox
            justify
            label="AniDB User"
            id="AniDB"
            isChecked={selectedUser.CommunitySites?.AniDB}
            onChange={handleInputChange}
            className="h-8"
          />
          <Checkbox
            justify
            label="Trakt User"
            id="Trakt"
            isChecked={selectedUser.CommunitySites?.Trakt}
            onChange={handleInputChange}
            className="h-8"
          />
          <div className="flex items-center justify-between">
            Change Avatar
            <div className="flex gap-x-2">
              <label
                htmlFor="avatar"
                className="flex cursor-pointer items-center rounded-lg border border-panel-border bg-button-secondary px-4 py-1 text-xs font-semibold drop-shadow-md hover:bg-button-secondary-hover"
              >
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
                <Button onClick={removeAvatar} buttonType="danger" buttonSize="small">
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col">
        <div className="mb-4 flex h-8 justify-between">
          <div className="flex h-[2.149rem] items-center font-semibold">Password</div>
          <Button
            onClick={() => handlePasswordChange()}
            loading={isChangePasswordPending}
            disabled={newPassword === ''}
            buttonType="primary"
            buttonSize="small"
          >
            Change
          </Button>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="flex h-8 justify-between">
            <div className="mx-0 my-auto">New Password</div>
            <InputSmall
              id="new-password"
              value={newPassword}
              type="password"
              onChange={event => setNewPassword(event.target.value)}
              className="w-36 px-3 py-1"
              autoComplete="new-password"
            />
          </div>
          <div className="h-8">
            <Checkbox
              justify
              label="Logout all sessions"
              id="logout-all"
              isChecked={logoutOthers}
              onChange={event => setLogoutOthers(event.target.checked)}
              className="justify-between"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex h-[2.149rem] items-center font-semibold">Tag Restrictions</div>
        <div>
          <div className="mb-2 font-semibold">Available Tags</div>
          <Input
            type="text"
            placeholder="Search..."
            startIcon={mdiMagnify}
            id="search"
            value={tagSearch}
            onChange={event => setTagSearch(event.target.value)}
          />
          <div className="mt-2 w-full rounded-lg border border-panel-border bg-panel-input p-4 capitalize">
            {tagsQuery.isPending && (
              <div className="flex h-64 items-center justify-center text-panel-text-primary">
                <Icon path={mdiLoading} spin size={3} />
              </div>
            )}
            {tagsQuery.isSuccess && (
              <div className="h-64 overflow-y-auto bg-panel-input">
                {tagsQuery.data?.filter(tag => tag.Name.includes(tagSearch)).map(tag => (
                  <div
                    className="mt-2 cursor-pointer first:mt-0"
                    key={`tagData-${tag.ID}`}
                    onClick={() => handleTagChange(tag.ID, true)}
                  >
                    {tag.Name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="mb-2 font-semibold">Selected Tags</div>
          <div className="flex min-h-32 flex-col rounded-lg border border-panel-border bg-panel-input p-4">
            {selectedUser.RestrictedTags?.length
              ? selectedUser.RestrictedTags?.map(tag => (
                <div className="mt-2 flex justify-between capitalize first:mt-0" key={`selectedTag-${tag}`}>
                  {tagsQuery.data?.find(
                    tagData =>
                      tagData.ID === tag,
                  )?.Name ?? 'Unknown'}
                  <Button
                    onClick={() =>
                      handleTagChange(tag, false)}
                  >
                    <Icon path={mdiMinusCircleOutline} size={1} className="text-panel-text-danger" />
                  </Button>
                </div>
              ))
              : <div className="flex grow items-center justify-center font-semibold">No Restricted Tags!</div>}
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={() => handleCancel()} buttonType="secondary" buttonSize="normal">Cancel</Button>
        <Button onClick={() => editUser(selectedUser)} buttonType="primary" buttonSize="normal">Save</Button>
      </div>

      <AvatarEditorModal
        show={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        image={avatarFile}
        changeAvatar={changeAvatar}
      />
    </>
  );
}

export default UserManagementSettings;
