import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEdit } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import Button from '../Buttons/Button';
import { setStatus as setProfileModalStatus } from '../../core/slices/modals/profile';
import ModalPanel from '../Panels/ModalPanel';
import Input from '../Input/Input';

type State = {
  username: string;
  password: string;
  usernameDisabled: boolean;
  passwordDisabled: boolean;
};

class ProfileModal extends React.Component<Props, State> {
  state = {
    username: 'username',
    password: 'notchanged',
    usernameDisabled: true,
    passwordDisabled: true,
  };

  componentDidMount() {
    const { username } = this.props;
    this.setState({
      username,
    });
  }

  handleClose = (save = false) => {
    const { setStatus, changePassword } = this.props;
    const { username, password } = this.state;

    if (save) {
      if (password !== 'notchanged') {
        changePassword(username, password);
      }
    }

    this.setState({
      password: 'notchanged',
      usernameDisabled: true,
      passwordDisabled: true,
    });

    setStatus(false);
  };

  handleInputChange = (event: any) => {
    const { id, value } = event.target;
    this.setState(prevState => Object.assign(prevState, { [id]: value }));
  };

  editUsername = () => {
    this.setState({
      usernameDisabled: false,
    });
  };

  editPassword = () => {
    this.setState({
      password: '',
      passwordDisabled: false,
    });
  };

  render() {
    const { show, username: oldUsername } = this.props;
    const {
      username, password, usernameDisabled, passwordDisabled,
    } = this.state;

    return (
      <ModalPanel show={show} className="profile-modal">
        <div className="flex w-full h-full">
          <div className="flex profile-modal-image">
            <div className="flex flex-grow profile-modal-image-alpha justify-center items-center">
              <span className="flex items-center justify-center bg-color-accent w-48 h-48 text-2xl rounded-full mr-2">{oldUsername.charAt(0)}</span>
            </div>
          </div>
          <div className="flex flex-grow flex-col px-4 py-2">
            <div className="flex justify-between">
              <span className="flex font-semibold text-xl2 uppercase fixed-panel-header">User Profile</span>
              <span className="flex">
                <Button onClick={() => this.handleClose()}>
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
              </span>
            </div>
            <div className="bg-color-accent-secondary my-2 h-1 w-10 flex-shrink-0" />
            <div className="flex flex-col flex-grow justify-between">
              <div className="flex flex-col">
                <div className="flex">
                  <Input className="w-24" label="Username" id="username" value={username} type="text" disabled={usernameDisabled} onChange={this.handleInputChange} />
                  <Button onClick={() => this.editUsername()} className="flex mt-1 color-accent">
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                </div>
                <div className="flex mt-1">
                  <Input className="w-24" label="Password" id="password" value={password} type="password" placeholder="Password" disabled={passwordDisabled} onChange={this.handleInputChange} />
                  <Button onClick={() => this.editPassword()} className="flex mt-1 color-accent">
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                </div>
                <div className="flex mt-1">
                  <Input className="w-24" label="User Group" id="user-group" value="Admin" type="text" disabled onChange={() => {}} />
                </div>
              </div>
              <div className="flex justify-end mb-2">
                <Button onClick={() => this.handleClose(true)} className="py-1 px-4 bg-color-accent font-muli font-semibold text-sm">Save</Button>
              </div>
            </div>
          </div>
        </div>
      </ModalPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  show: state.modals.profile.status,
  username: state.apiSession.username,
});

const mapDispatch = {
  setStatus: (value: boolean) => (setProfileModalStatus(value)),
  changePassword: (username: string, password: string) => (
    { type: Events.CHANGE_PASSWORD, payload: { username, password } }
  ),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(ProfileModal);
