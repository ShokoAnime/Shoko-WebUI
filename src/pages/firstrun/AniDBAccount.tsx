import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { getAnidb } from '../../core/actions/firstrun';
import Button from '../../components/Buttons/Button';
import Input from '../../components/Input/Input';
import Footer from './Footer';


class AniDBAccount extends React.Component<Props> {
  componentDidMount() {
    const { getAnidbFunc } = this.props;
    getAnidbFunc();
  }

  handleInputChange = (event: any) => {
    const { changeSetting } = this.props;
    const name = event.target.id;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    changeSetting(name, value);
  };

  render() {
    const {
      login, password, port, status, isFetching, testAnidb, saveAnidb,
    } = this.props;

    return (
      <React.Fragment>
        <div className="flex flex-col flex-grow p-10">
          <div className="font-bold text-lg">Adding Your AniDB Account</div>
          <div className="font-muli mt-5">
            Shoko uses AniDB to compare your file hashes with its extensive database to quickly
            figure out and add series to your collection. AniDB also provides additional series
            and episode information that enhances your usage.
          </div>
          <div className="font-muli mt-2">
            An AniDB account is required to use Shoko. <a href="https://anidb.net/" target="_blank" rel="noreferrer" className="color-accent-secondary">Click Here</a> to create one.
          </div>
          <div className="flex flex-col w-1/2 mt-3">
            <Input id="login" value={login} label="Username" type="text" placeholder="Username" onChange={this.handleInputChange} className="py-2" />
            <Input id="password" value={password} label="Password" type="password" placeholder="Password" onChange={this.handleInputChange} className="py-2" />
            <Input id="port" value={port} label="Port" type="text" placeholder="Port" onChange={this.handleInputChange} className="py-2" />
          </div>
          <div className="flex mt-4 items-center">
            <Button onClick={() => testAnidb()} className="bg-color-accent-secondary  py-2 px-3 rounded mr-4">Test</Button>
            {isFetching ? (
              <div>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />Testing...
              </div>
            ) : (
              <div className={cx(['flex ', status.type === 'error' ? 'color-danger' : 'color-accent'])}>
                {status.text}
              </div>
            )}
          </div>
        </div>
        <Footer prevTabKey="tab-local-setup" nextTabKey="tab-community-sites" saveFunc={saveAnidb} />
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.firstrun.anidb),
  isFetching: state.fetching.firstrunAnidb,
});

const mapDispatch = {
  changeSetting: (field: string, value: string) => (getAnidb({ [field]: value })),
  saveAnidb: () => ({ type: Events.FIRSTRUN_SET_ANIDB }),
  testAnidb: () => ({ type: Events.FIRSTRUN_TEST_ANIDB }),
  getAnidbFunc: () => ({ type: Events.FIRSTRUN_GET_ANIDB }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(AniDBAccount);
