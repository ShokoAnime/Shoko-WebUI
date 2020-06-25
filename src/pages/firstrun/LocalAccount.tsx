import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { setSaved as setFirstRunSaved, setUser } from '../../core/slices/firstrun';
import Footer from './Footer';
import Input from '../../components/Input/Input';

class LocalAccount extends React.Component<Props> {
  componentDidMount() {
    const { getUser } = this.props;
    getUser();
  }

  handleInputChange = (event: any) => {
    const { changeSetting } = this.props;
    const name = event.target.id;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    changeSetting(name, value);
  };

  handleSave = () => {
    const { setSaved, saveUser } = this.props;
    saveUser();
    setSaved('local-account');
  };

  render() {
    const {
      Username, Password,
    } = this.props;

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
            <Input id="Username" value={Username} label="Username" type="text" placeholder="Username" onChange={this.handleInputChange} className="py-2" />
            <Input id="Password" value={Password} label="Password" type="password" placeholder="Password" onChange={this.handleInputChange} className="py-2" />
          </div>
        </div>
        <Footer prevTabKey="db-setup" nextTabKey="anidb-account" saveFunction={this.handleSave} />
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.firstrun.user),
});

const mapDispatch = {
  saveUser: () => ({ type: Events.FIRSTRUN_SET_USER }),
  getUser: () => ({ type: Events.FIRSTRUN_GET_USER }),
  changeSetting: (id: string, value: string) => (setUser({ [id]: value })),
  setSaved: (value: string) => (setFirstRunSaved(value)),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(LocalAccount);
