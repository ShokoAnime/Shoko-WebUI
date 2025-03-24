import React, { useEffect, useMemo, useState } from 'react';
import { mdiAccountPlus, mdiCircleEditOutline, mdiLoading, mdiMagnify, mdiMinusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { find, isEqual, map, remove } from 'lodash';
import { useImmer } from 'use-immer';
import { useToggle } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import InputSmall from '@/components/Input/InputSmall';
import AddUserModal from '@/components/Settings/AddUserModal';
import AvatarEditorModal from '@/components/Settings/AvatarEditorModal';
import toast from '@/components/Toast';
import { useAniDBTagsQuery } from '@/core/react-query/tag/queries';
import { useDeleteUserMutation, usePutUserMutation } from '@/core/react-query/user/mutations';
import { useCurrentUserQuery, useUsersQuery } from '@/core/react-query/user/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { UserType } from '@/core/types/api/user';

function UserManagementSettings() {
  const currentUserQuery = useCurrentUserQuery();
  const usersQuery = useUsersQuery();
  const { isPending: editUserPending, mutate: editUser } = usePutUserMutation();
  const { mutate: deleteUser } = useDeleteUserMutation();

  const [selectedUser, setSelectedUser] = useImmer<UserType | undefined>(undefined);
  const [tagSearch, setTagSearch] = useState('');
  const [avatarFile, setAvatarFile] = useState<File>();
  const [showAvatarModal, toggleAvatarModal] = useToggle(false);
  const [addUserModalState, setAddUserModalState] = useState<{ show: boolean, userId: number | null }>(() => ({
    show: false,
    userId: null,
  }));

  const tagsQuery = useAniDBTagsQuery({ pageSize: 0, excludeDescriptions: true });

  const handleAddUserButton = useEventCallback(() => {
    setAddUserModalState({ show: true, userId: null });
  });

  const handleEditUserPasswordButton = useEventCallback(() => {
    if (!selectedUser?.ID) return;
    setAddUserModalState({ show: true, userId: selectedUser.ID });
  });

  const handleAddUserModalClose = useEventCallback(() => {
    setAddUserModalState({ ...addUserModalState, show: false });
  });

  useEffect(() => {
    if (!usersQuery.data || !!selectedUser) return;
    setSelectedUser(usersQuery.data[0]);
  }, [selectedUser, setSelectedUser, usersQuery.data]);

  const unsavedChanges = useMemo(
    () => {
      if (!selectedUser?.ID) return false;
      const user = find(usersQuery.data, tempUser => tempUser.ID === selectedUser.ID);
      return !isEqual(selectedUser, user);
    },
    [selectedUser, usersQuery.data],
  );

  useEffect(() => {
    if (!selectedUser?.ID) return;
    if (!unsavedChanges) {
      toast.dismiss('unsaved');
    } else {
      toast.info(
        'Unsaved Changes',
        'Please save before leaving this page.',
        { autoClose: false, position: 'top-right', toastId: 'unsaved' },
      );
    }
  }, [selectedUser, unsavedChanges]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

    setSelectedUser((draftState) => {
      if (!draftState) return;
      if ((id === 'Trakt' || id === 'AniDB') && typeof value === 'boolean') draftState.CommunitySites[id] = value;
      else draftState[id] = value;
    });
  };

  const handleCancel = useEventCallback(() => {
    setSelectedUser(find(usersQuery.data, user => user.ID === selectedUser?.ID));
  });

  const openAvatarModal = (event: React.ChangeEvent<HTMLInputElement>) => {
    const avatar = event.target.files?.[0];
    // eslint-disable-next-line no-param-reassign
    event.target.value = ''; // This is a hack (yes, another) to make the onChange trigger even when same file is selected
    if (!avatar) return;
    setAvatarFile(avatar);
    toggleAvatarModal();
  };

  const changeAvatar = (avatar: string) => {
    setSelectedUser((draftState) => {
      if (!draftState) return;
      draftState.Avatar = avatar;
    });
  };

  const removeAvatar = useEventCallback(() => changeAvatar(''));

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
    setSelectedUser((draftState) => {
      if (!draftState) return;

      if (!selected) {
        remove(draftState.RestrictedTags, tag => tag === tagId);
        return;
      }

      if (draftState.RestrictedTags.find(tag => tag === tagId)) return;

      draftState.RestrictedTags.push(tagId);
      draftState.RestrictedTags = draftState.RestrictedTags.sort((tagA, tagB) => {
        const tagAName = tagsQuery.data?.find(tag => tag.ID === tagA)?.Name;
        const tagBName = tagsQuery.data?.find(tag => tag.ID === tagB)?.Name;
        if (tagAName === undefined || tagBName === undefined) return 0;
        return tagAName?.localeCompare(tagBName);
      });
    });
  };

  if (!selectedUser) {
    return <Icon path={mdiLoading} size={4} spin className="m-auto text-panel-text-primary" />;
  }

  return (
    <>
      <title>Settings &gt; User Management | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">User Management</div>
        <div>
          Configure Shoko user accounts by changing usernames, passwords, avatars, and specifying which tags a user is
          restricted from viewing.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Current Users</span>
          <Button onClick={handleAddUserButton} tooltip="Add User">
            <Icon
              className="text-panel-icon-action"
              path={mdiAccountPlus}
              size={0.85}
            />
          </Button>
        </div>
        <div className="flex flex-col gap-y-1">
          {map(usersQuery.data, user => (
            <div className="flex h-8 justify-between" key={`user-${user.ID}`}>
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
        <div className="flex items-center justify-between font-semibold">
          User Options
          <div className="flex gap-x-2">
            <label
              htmlFor="avatar"
              className="flex cursor-pointer items-center rounded-lg border border-panel-border bg-button-secondary px-4 py-1 text-sm font-semibold hover:bg-button-secondary-hover"
            >
              Pick Avatar
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
                Remove Avatar
              </Button>
            )}
            <Button
              onClick={handleEditUserPasswordButton}
              buttonType="primary"
              buttonSize="small"
            >
              Change Password
            </Button>
          </div>
        </div>
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
            Plex Users
            <InputSmall
              id="PlexUsernames"
              value={selectedUser.PlexUsernames}
              type="text"
              onChange={handleInputChange}
              className="w-48 px-3 py-1"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">Tag Restrictions</div>
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
        <Button onClick={handleCancel} buttonType="secondary" buttonSize="normal">Cancel</Button>
        <Button
          onClick={() => editUser(selectedUser)}
          buttonType="primary"
          buttonSize="normal"
          disabled={!unsavedChanges}
          loading={editUserPending}
        >
          Save
        </Button>
      </div>

      <AddUserModal show={addUserModalState.show} userId={addUserModalState.userId} onClose={handleAddUserModalClose} />
      <AvatarEditorModal
        show={showAvatarModal}
        onClose={toggleAvatarModal}
        image={avatarFile}
        changeAvatar={changeAvatar}
      />
    </>
  );
}

export default UserManagementSettings;
