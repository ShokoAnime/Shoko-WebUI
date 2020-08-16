import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTasks, faListAlt, faImage, faCaretDown,
  faUser, faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import Button from '../Buttons/Button';
import { setStatus } from '../../core/slices/modals/profile';

const icons = { hasher: faTasks, general: faListAlt, images: faImage };

type State = {
  userDropdown: boolean,
};

class Header extends React.Component<Props, State> {
  state = {
    userDropdown: false,
  };

  componentDidMount() {
    const { showProfile } = this.props;
    showProfile(false);
  }

  handleShowProfile = () => {
    const { showProfile } = this.props;
    showProfile(true);
    this.setState({ userDropdown: false });
  };

  renderItem = (key = '', count: number) => (
    <div className="flex items-center" key={key}>
      <FontAwesomeIcon icon={icons[key]} className="mr-2 text-lg" />
      <span className="font-semibold text-lg color-accent mr-4">{count ?? 0}</span>
    </div>
  );

  renderDropdown = () => {
    const { logout } = this.props;
    return (
      <div className="flex flex-col absolute right-0 w-48 shadow-lg z-50 px-4 py-2 rounded-lg user-dropdown border items-start">
        <Button onClick={() => this.handleShowProfile()} className="py-2">
          <FontAwesomeIcon icon={faUser} className="mr-2" />Profile
        </Button>
        <Button onClick={() => logout()} className="py-2">
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />Logout
        </Button>
      </div>
    );
  };

  toggleDropdown = () => {
    const { userDropdown } = this.state;
    this.setState({ userDropdown: !userDropdown });
  };

  render() {
    const { items, username } = this.props;
    const { userDropdown } = this.state;

    const commands: Array<any> = [];

    if (items) {
      commands.push(this.renderItem('hasher', items.HasherQueueCount));
      commands.push(this.renderItem('general', items.GeneralQueueCount));
      commands.push(this.renderItem('images', items.ImageQueueCount));
    }

    return (
      <React.Fragment>
        <div className="flex header w-full px-10 py-2 justify-between items-center shadow-md border-b">
          <div className="flex">
            {commands}
          </div>
          <div className="flex flex-col">
            <div className="flex cursor-pointer justify-end user-dropdown-toggle px-2 py-2" onClick={() => this.toggleDropdown()}>
              <span className="flex items-center justify-center bg-color-accent w-12 h-12 text-xl rounded-full mr-2">{username.charAt(0)}</span>
              <div className="flex flex-col justify-center">
                <div className="font-semibold font-muli">
                  <span className="mr-2">{username}</span>
                  <FontAwesomeIcon icon={faCaretDown} className="color-accent" />
                </div>
                <span className="font-bold font-muli color-accent-secondary">Admin</span>
              </div>
            </div>
            <div className="flex relative mt-2">
              {userDropdown && this.renderDropdown()}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  items: state.mainpage.queueStatus,
  username: state.apiSession.username,
  isFetching: state.fetching.queueStatus,
});

const mapDispatch = {
  logout: () => ({ type: Events.AUTH_LOGOUT }),
  showProfile: (value: boolean) => (setStatus(value)),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(Header);
