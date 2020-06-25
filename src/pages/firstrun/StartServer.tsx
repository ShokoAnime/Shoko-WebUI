import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { setSaved as setFirstRunSaved } from '../../core/slices/firstrun';
import Footer from './Footer';
import Button from '../../components/Buttons/Button';

class StartServer extends React.Component<Props> {
  handleSave = () => {
    const { setSaved, startServer } = this.props;
    startServer();
    setSaved('start-server');
  };

  handleNext = () => {
    const { stopPollingStatus, user, signIn } = this.props;
    stopPollingStatus();
    signIn({
      user: user.Username,
      pass: user.Password,
      device: 'web-ui',
      redirect: false,
    });
  };

  render() {
    const { status, saved } = this.props;

    return (
      <React.Fragment>
        <div className="flex flex-col flex-grow p-10">
          <div className="font-bold text-lg">Start Server</div>
          <div className="font-muli mt-5">
            On this page you can try and start the server, startup progress will be reported below.
            After the startup and database creation process is complete you will be able to setup
            import folders.
          </div>
          <div className="flex flex-col mt-4 items-center">
            <div className="flex w-full">
              <span className="font-bold mr-1">Status:</span>{status.State === 2 ? 'Started!' : (status.StartupMessage || 'Idle')}
            </div>
            {status.State === 4 && (
              <Button onClick={() => this.handleSave()} className="bg-color-accent-secondary py-2 px-3 rounded mt-4">Start</Button>
            )}
          </div>
        </div>
        <Footer prevTabKey="community-sites" nextTabKey="import-folders" prevDisabled={status.State !== 4} nextDisabled={!saved} saveFunction={this.handleNext} />
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  status: state.firstrun.status,
  saved: state.firstrun.saved['start-server'],
  user: state.firstrun.user,
});

const mapDispatch = {
  setSaved: (value: string) => (setFirstRunSaved(value)),
  startServer: () => ({ type: Events.FIRSTRUN_START_SERVER }),
  stopPollingStatus: () => ({ type: Events.STOP_API_POLLING, payload: { type: 'server-status' } }),
  signIn: (payload: any) => ({ type: Events.AUTH_LOGIN, payload }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(StartServer);
