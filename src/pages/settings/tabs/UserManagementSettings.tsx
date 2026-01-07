import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { mdiCircleEditOutline, mdiLoading, mdiMagnify, mdiMinusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { find, isEqual, map, remove } from 'lodash';
import { useImmer } from 'use-immer';
import { useToggle } from 'usehooks-ts';

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

function UserManagementSettings() {
  const { t } = useTranslation('settings');
  const dispatch = useDispatch();

  const currentUserQuery = useCurrentUserQuery();
  const usersQuery = useUsersQuery();
  const { isPending: editUserPending, mutate: editUser } = usePutUserMutation();
  const { mutate: deleteUser } = useDeleteUserMutation();
  const { isPending: isChangePasswordPending, mutate: changePassword } = useChangePasswordMutation();

  const [selectedUser, setSelectedUser] = useImmer<UserType | undefined>(undefined);
  const [newPassword, setNewPassword] = useState('');
  const [logoutOthers, toggleLogoutOthers, setLogoutOthers] = useToggle(false);
  const [tagSearch, setTagSearch] = useState('');
  const [avatarFile, setAvatarFile] = useState<File>();
  const [showAvatarModal, toggleAvatarModal] = useToggle(false);

  const tagsQuery = useAniDBTagsQuery({ pageSize: 0, excludeDescriptions: true });

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
        t('page.unsaved.title'),
        t('page.unsaved.message'),
        { autoClose: false, position: 'top-right', toastId: 'unsaved' },
      );
    }
  }, [selectedUser, t, unsavedChanges]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

    setSelectedUser((draftState) => {
      if (!draftState) return;
      if ((id === 'Trakt' || id === 'AniDB') && typeof value === 'boolean') draftState.CommunitySites[id] = value;
      else draftState[id] = value;
    });
  };

  useEffect(() => {
    if (newPassword) {
      toast.info(
        t('userManagement.toasts.passwordFieldChanged'),
        t('userManagement.toasts.passwordFieldChangedMessage'),
        {
          autoClose: false,
          draggable: false,
          closeOnClick: false,
          toastId: 'password-changed',
        },
      );
    } else {
      toast.dismiss('password-changed');
    }
  }, [newPassword, t]);

  const handlePasswordChange = useEventCallback(() => {
    if (!selectedUser) return;
    changePassword({
      Password: newPassword,
      RevokeAPIKeys: logoutOthers,
      userId: selectedUser.ID,
    }, {
      onSuccess: () => {
        setNewPassword('');
        if (currentUserQuery.data?.ID === selectedUser.ID && logoutOthers) {
          toast.success(t('userManagement.toasts.passwordChangedSuccess'), t('userManagement.toasts.logoutWarning'), {
            autoClose: 5000,
          });
          setTimeout(() => {
            dispatch({ type: Events.AUTH_LOGOUT });
          }, 6000);
        } else toast.success('Password changed successfully!');
      },
    });
  });

  const handleCancel = useEventCallback(() => {
    setNewPassword('');
    setLogoutOthers(false);
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
        t('userManagement.toasts.deleteSelfTitle'),
        t('userManagement.toasts.deleteSelfMessage'),
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
        <div className="text-xl font-semibold">{t('page.menu.user-management')}</div>
        <div>
          {t('userManagement.description')}
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">{t('userManagement.currentUsers')}</div>
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
          {t('userManagement.userOptions')}
          <div className="flex gap-x-2">
            <label
              htmlFor="avatar"
              className="flex cursor-pointer items-center rounded-lg border border-panel-border bg-button-secondary px-4 py-1 text-sm font-semibold drop-shadow-md hover:bg-button-secondary-hover"
            >
              {t('userManagement.pickAvatar')}
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
                {t('userManagement.removeAvatar')}
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="flex h-8 justify-between">
            <div className="mx-0 my-auto">{t('userManagement.displayName')}</div>
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
            label={t('userManagement.administrator')}
            id="IsAdmin"
            isChecked={selectedUser.IsAdmin}
            onChange={handleInputChange}
            className="h-8"
          />
          <Checkbox
            justify
            label={t('userManagement.anidbUser')}
            id="AniDB"
            isChecked={selectedUser.CommunitySites?.AniDB}
            onChange={handleInputChange}
            className="h-8"
          />
          <Checkbox
            justify
            label={t('userManagement.traktUser')}
            id="Trakt"
            isChecked={selectedUser.CommunitySites?.Trakt}
            onChange={handleInputChange}
            className="h-8"
          />
          <div className="flex items-center justify-between">
            {t('userManagement.plexUsers')}
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

      <div className="flex flex-col">
        <div className="mb-4 flex justify-between">
          <div className="flex items-center font-semibold">{t('userManagement.password')}</div>
          <Button
            onClick={handlePasswordChange}
            loading={isChangePasswordPending}
            disabled={newPassword === ''}
            buttonType="primary"
            buttonSize="small"
          >
            {t('userManagement.changePassword')}
          </Button>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="flex h-8 justify-between">
            <div className="mx-0 my-auto">{t('userManagement.newPassword')}</div>
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
              label={t('userManagement.logoutAllSessions')}
              id="logout-all"
              isChecked={logoutOthers}
              onChange={toggleLogoutOthers}
              className="justify-between"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">{t('userManagement.tagRestrictions')}</div>
        <div>
          <div className="mb-2 font-semibold">{t('userManagement.availableTags')}</div>
          <Input
            type="text"
            placeholder={t('userManagement.searchPlaceholder')}
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
          <div className="mb-2 font-semibold">{t('userManagement.selectedTags')}</div>
          <div className="flex min-h-32 flex-col rounded-lg border border-panel-border bg-panel-input p-4">
            {selectedUser.RestrictedTags?.length
              ? selectedUser.RestrictedTags?.map(tag => (
                <div className="mt-2 flex justify-between capitalize first:mt-0" key={`selectedTag-${tag}`}>
                  {tagsQuery.data?.find(
                    tagData =>
                      tagData.ID === tag,
                  )?.Name ?? t('userManagement.unknownTag')}
                  <Button
                    onClick={() =>
                      handleTagChange(tag, false)}
                  >
                    <Icon path={mdiMinusCircleOutline} size={1} className="text-panel-text-danger" />
                  </Button>
                </div>
              ))
              : <div className="flex grow items-center justify-center font-semibold">{t('userManagement.noTags')}</div>}
          </div>
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={handleCancel} buttonType="secondary" buttonSize="normal">{t('page.actions.cancel')}</Button>
        <Button
          onClick={() => editUser(selectedUser)}
          buttonType="primary"
          buttonSize="normal"
          disabled={!unsavedChanges}
          loading={editUserPending}
        >
          {t('page.actions.save')}
        </Button>
      </div>

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
