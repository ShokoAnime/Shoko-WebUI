import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { getUser } from '../../core/actions/firstrun';
import Input from '../../components/Input/Input';
import Events from '../../core/events';
import { RootState } from '../../core/store';
import Footer from './Footer';

class LocalAccount extends React.Component<Props> {
  componentDidMount() {
    const { getUserFunc } = this.props;
    getUserFunc();
  }

  handleInputChange = (event: any) => {
    const { changeSetting } = this.props;
    const name = event.target.id;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    changeSetting(name, value);
  };

  render() {
    const { login, password, saveUser } = this.props;

    return (
      <React.Fragment>
        <div className="flex flex-col flex-grow p-10">
          <div className="font-bold text-lg">Create Your Account</div>
          <div className="font-muli mt-5">
            In order to use Shoko you&apos;ll need to create an account. This local account will
            allow you to login to Shoko and will link your account with any community site accounts
            provided later on.
          </div>
          <div className="flex flex-col w-1/2 mt-4">
            <Input id="login" value={login} label="Username" type="text" placeholder="Username" onChange={this.handleInputChange} className="py-2" />
            <Input id="password" value={password} label="Password" type="password" placeholder="Password" onChange={this.handleInputChange} className="py-2" />
          </div>
        </div>
        <Footer prevTabKey="tab-db-setup" nextTabKey="tab-anidb-account" saveFunc={saveUser} />
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.firstrun.user),
});

const mapDispatch = {
  changeSetting: (field: string, value: string) => (getUser({ [field]: value })),
  saveUser: () => ({ type: Events.FIRSTRUN_SET_USER }),
  getUserFunc: () => ({ type: Events.FIRSTRUN_GET_USER }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(LocalAccount);
