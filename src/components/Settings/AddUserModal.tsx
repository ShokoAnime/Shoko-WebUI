import React, { useLayoutEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useToggle } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import Events from '@/core/events';
import { useAddUserMutation, useChangePasswordMutation } from '@/core/react-query/user/mutations';
import { useCurrentUserQuery } from '@/core/react-query/user/queries';
import useEventCallback from '@/hooks/useEventCallback';

export type AddUserModalProps = {
  show: boolean;
  userId: number | null;
  onClose: () => void;
};

function AddUserModal(props: AddUserModalProps): React.JSX.Element {
  const { onClose, show, userId } = props;
  const dispatch = useDispatch();
  const currentUserQuery = useCurrentUserQuery();
  const { mutate: addUser, status: addStatus } = useAddUserMutation();
  const { mutate: updatePassword, status: updateStatus } = useChangePasswordMutation();

  const [username, setUsername] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [logoutOthers, toggleLogoutOthers, setLogoutOthers] = useToggle(false);
  const isLoading = addStatus === 'pending' || updateStatus === 'pending';
  const isExisting = userId != null && userId > 0;
  const canSave = (isExisting || username.length > 0) && password1 === password2;

  const handleClose = useEventCallback(() => {
    if (isLoading) return;
    onClose();
  });

  const handleUsernameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.id === 'confirm-password') setPassword2(event.target.value);
    else setPassword1(event.target.value);
  };

  const handleSave = () => {
    if (isLoading || !canSave) return;
    if (isExisting) {
      updatePassword({ userId, Password: password1, RevokeAPIKeys: logoutOthers }, {
        onSuccess() {
          if (currentUserQuery.data?.ID === userId && logoutOthers) {
            toast.success('Password changed successfully!', 'You will be logged out in 5 seconds!', {
              autoClose: 5000,
            });
            setTimeout(() => {
              dispatch({ type: Events.AUTH_LOGOUT });
            }, 6000);
          } else toast.success('Password changed successfully!');
          onClose();
        },
        onError(error) {
          toast.error('Failed to update password for user!');
          console.error(error);
        },
      });
    } else {
      addUser({ Username: username, Password: password1 }, {
        onSuccess() {
          toast.success('User has been added successfully!');
          onClose();
        },
        onError(error) {
          toast.error('Failed to add user!');
          console.error(error);
        },
      });
    }
  };

  const handleKeyUp = useEventCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSave();
  });

  useLayoutEffect(() => {
    if (!show) return;
    setUsername('');
    setPassword1('');
    setPassword2('');
    setLogoutOthers(false);
  }, [show, setLogoutOthers]);

  return (
    <ModalPanel
      show={show}
      onRequestClose={handleClose}
      size="sm"
      header={isExisting ? 'Change Password' : 'Add User'}
    >
      <div className="flex flex-col gap-y-3">
        {!isExisting && (
          <Input
            id="username"
            value={username}
            label="Username"
            type="text"
            autoFocus={!isExisting}
            placeholder="Username"
            onChange={handleUsernameInputChange}
            onKeyUp={handleKeyUp}
            className="w-full"
          />
        )}
        <Input
          id="password"
          value={password1}
          label="Password"
          type="password"
          autoFocus={isExisting}
          placeholder="Password"
          onChange={handlePasswordInputChange}
          onKeyUp={handleKeyUp}
          className="w-full"
        />
        <Input
          id="confirm-password"
          value={password2}
          label="Confirm Password"
          type="password"
          placeholder="Confirm Password"
          onChange={handlePasswordInputChange}
          onKeyUp={handleKeyUp}
          className="w-full"
        />
        {isExisting && (
          <div className="h-8">
            <Checkbox
              justify
              label="Logout all sessions"
              id="logout-all"
              isChecked={logoutOthers}
              onChange={toggleLogoutOthers}
              className="justify-between"
            />
          </div>
        )}
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-6 py-2" disabled={isLoading}>Cancel</Button>
        <Button onClick={handleSave} buttonType="primary" className="px-6 py-2" loading={isLoading} disabled={!canSave}>
          {isExisting ? 'Save' : 'Add'}
        </Button>
      </div>
    </ModalPanel>
  );
}

export default AddUserModal;
