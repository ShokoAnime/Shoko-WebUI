import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiClose, mdiPencil } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import Events from '@/core/events';
import { setStatus as setProfileModalStatus } from '@/core/slices/modals/profile';

import type { RootState } from '@/core/store';

function ProfileModal() {
  const dispatch = useDispatch();

  const status = useSelector((state: RootState) => state.modals.profile.status);
  const oldUsername = useSelector((state: RootState) => state.apiSession.username);
  const rememberUser = useSelector((state: RootState) => state.apiSession.rememberUser);

  const [username, setUsername] = useState('username');
  const [password, setPassword] = useState('notchanged');
  const [usernameDisabled, setUsernameDisabled] = useState(true);
  const [passwordDisabled, setPasswordDisabled] = useState(true);

  useEffect(() => {
    setUsername(oldUsername);
  }, [oldUsername]);

  const handleClose = (save = false) => {
    if (save && password !== 'notchanged') {
      dispatch({
        type: Events.AUTH_CHANGE_PASSWORD,
        payload: { username, password, rememberUser },
      });
    }

    setPassword('notchanged');
    setPasswordDisabled(true);
    setUsernameDisabled(true);

    dispatch(setProfileModalStatus(false));
  };

  return (
    <ModalPanel show={status} className="profile-modal" onRequestClose={() => handleClose()} title="Profile">
      <div className="flex h-full w-full flex-col">
        <div className="profile-modal-image flex rounded-l-lg">
          <div className="profile-modal-image-alpha flex grow items-center justify-center rounded-l-lg">
            <span className="mr-2 flex h-48 w-48 items-center justify-center rounded-full bg-panel-text-primary text-2xl">
              {oldUsername.charAt(0)}
            </span>
          </div>
        </div>
        <div className="flex grow flex-col px-4 py-2">
          <div className="flex justify-between">
            <span className="flex text-base font-semibold uppercase">User Profile</span>
            <span className="flex">
              <Button onClick={() => handleClose()}>
                <Icon path={mdiClose} size={1} />
              </Button>
            </span>
          </div>
          <div className="my-2 h-1 w-10 shrink-0 bg-panel-text-important" />
          <div className="flex grow flex-col justify-between">
            <div className="flex flex-col">
              <div className="flex">
                <Input
                  className="w-24"
                  label="Username"
                  id="username"
                  value={username}
                  type="text"
                  disabled={usernameDisabled}
                  onChange={e => setUsername(e.target.value)}
                />
                <Button onClick={() => setUsernameDisabled(false)} className="mt-1 flex">
                  <Icon className="text-panel-text-primary" path={mdiPencil} size={1} />
                </Button>
              </div>
              <div className="mt-1 flex">
                <Input
                  className="w-24"
                  label="Password"
                  id="password"
                  value={password}
                  type="password"
                  placeholder="Password"
                  disabled={passwordDisabled}
                  onChange={e => setPassword(e.target.value)}
                />
                <Button onClick={() => setPasswordDisabled(false)} className="mt-1 flex">
                  <Icon className="text-panel-text-primary" path={mdiPencil} size={1} />
                </Button>
              </div>
              <div className="mt-1 flex">
                <Input
                  className="w-24"
                  label="User Group"
                  id="user-group"
                  value="Admin"
                  type="text"
                  disabled
                  onChange={() => {}}
                />
              </div>
            </div>
            <div className="mb-2 flex justify-end">
              <Button
                onClick={() => handleClose(true)}
                className="bg-panel-text-primary px-4 py-1 text-sm font-semibold"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ModalPanel>
  );
}

export default ProfileModal;
