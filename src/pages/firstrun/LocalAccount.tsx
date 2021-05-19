import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { setSaved as setFirstRunSaved, setUser } from '../../core/slices/firstrun';
import Footer from './Footer';
import Input from '../../components/Input/Input';
import TransitionDiv from '../../components/TransitionDiv';

import type { DefaultUserType } from '../../core/types/api/init';

class LocalAccount extends React.Component<Props> {
  componentDidMount() {
    const { getUser } = this.props;
    getUser();
  }

  handleInputChange = (event: any) => {
    const { changeSetting } = this.props;
    const { id, value } = event.target;
    changeSetting(id, value);
  };

  render() {
    const {
      Username, Password, status, saveUser,
      isFetching,
    } = this.props;

    return (
      <TransitionDiv className="flex flex-col flex-grow justify-center">
        <div className="font-bold text-lg">Create Your Account</div>
        <div className="font-mulish mt-5 text-justify">
          In order to use Shoko you&apos;ll need to create an account. This local account will
          allow you to login to Shoko and will link your account with any community site accounts
          provided later on.
        </div>
        <div className="flex flex-col my-8">
          <Input id="Username" value={Username} label="Username" type="text" placeholder="Username" onChange={this.handleInputChange} />
          <Input id="Password" value={Password} label="Password" type="password" placeholder="Password" onChange={this.handleInputChange} className="mt-6" />
        </div>
        <Footer nextDisabled={Username === ''} saveFunction={() => saveUser({ Username, Password })} isFetching={isFetching} status={status} />
      </TransitionDiv>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.firstrun.user),
  status: state.firstrun.userStatus,
  isFetching: state.fetching.firstrunLocalAcc,
});

const mapDispatch = {
  saveUser: (payload: DefaultUserType) => ({ type: Events.FIRSTRUN_SET_USER, payload }),
  getUser: () => ({ type: Events.FIRSTRUN_GET_USER }),
  changeSetting: (id: string, value: string) => (setUser({ [id]: value })),
  setSaved: (value: string) => (setFirstRunSaved(value)),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(LocalAccount);
