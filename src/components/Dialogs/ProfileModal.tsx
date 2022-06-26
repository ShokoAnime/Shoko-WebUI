import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEdit } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import Button from '../Input/Button';
import { setStatus as setProfileModalStatus } from '../../core/slices/modals/profile';
import ModalPanel from '../Panels/ModalPanel';
import Input from '../Input/Input';

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
    <ModalPanel show={status} className="profile-modal" onRequestClose={() => handleClose()}>
      <div className="flex w-full h-full">
        <div className="flex profile-modal-image rounded-l-lg">
          <div className="flex flex-grow profile-modal-image-alpha justify-center items-center rounded-l-lg">
            <span className="flex items-center justify-center bg-color-highlight-1 w-48 h-48 text-2xl rounded-full mr-2">{oldUsername.charAt(0)}</span>
          </div>
        </div>
        <div className="flex flex-grow flex-col px-4 py-2">
          <div className="flex justify-between">
            <span className="flex font-semibold text-xl2 uppercase">User Profile</span>
            <span className="flex">
              <Button onClick={() => handleClose()}>
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </span>
          </div>
          <div className="bg-color-highlight-2 my-2 h-1 w-10 flex-shrink-0" />
          <div className="flex flex-col flex-grow justify-between">
            <div className="flex flex-col">
              <div className="flex">
                <Input className="w-24" label="Username" id="username" value={username} type="text" disabled={usernameDisabled} onChange={e => setUsername(e.target.value)} />
                <Button onClick={() => setUsernameDisabled(false)} className="flex mt-1 color-highlight-1">
                  <FontAwesomeIcon icon={faEdit} />
                </Button>
              </div>
              <div className="flex mt-1">
                <Input className="w-24" label="Password" id="password" value={password} type="password" placeholder="Password" disabled={passwordDisabled} onChange={e => setPassword(e.target.value)} />
                <Button onClick={() => setPasswordDisabled(false)} className="flex mt-1 color-highlight-1">
                  <FontAwesomeIcon icon={faEdit} />
                </Button>
              </div>
              <div className="flex mt-1">
                <Input className="w-24" label="User Group" id="user-group" value="Admin" type="text" disabled onChange={() => { }} />
              </div>
            </div>
            <div className="flex justify-end mb-2">
              <Button onClick={() => handleClose(true)} className="py-1 px-4 bg-color-highlight-1 font-rubik font-semibold text-sm">Save</Button>
            </div>
          </div>
        </div>
      </div>
    </ModalPanel>
  );
}

export default ProfileModal;
