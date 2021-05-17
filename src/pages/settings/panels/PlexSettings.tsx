import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Input/Button';

import { setItem as setMiscItem } from '../../../core/slices/misc';

class PlexSettings extends React.Component<Props> {
  componentDidMount = () => {
    const { checkPlexAuthenticated, clearPlexUrl } = this.props;
    checkPlexAuthenticated();
    clearPlexUrl();
  };

  componentWillUnmount = () => {
    const { stopPolling } = this.props;
    stopPolling();
  };

  handleLinkOpen = () => {
    const { plexUrl, startPolling } = this.props;
    window.open(plexUrl, '_blank');
    startPolling();
  };

  renderPlexUrl() {
    const {
      fetching, plexUrl, getPlexUrl,
    } = this.props;

    if (!plexUrl || plexUrl === '') {
      return (
        <div className="flex justify-between flex-grow items-center">
          Plex Login:
          <Button onClick={() => getPlexUrl()} className="bg-color-highlight-2 px-2 py-1 text-xs">
            {fetching ? 'Requesting...' : 'Authenticate'}
          </Button>
        </div>
      );
    }
    return (
      <div className="flex flex-grow justify-between items-center">
        Plex Login:
        <Button onClick={() => this.handleLinkOpen()} className="color-highlight-2 hover:underline py-1 px-2 text-xs">Click here to login</Button>
      </div>
    );
  }

  render() {
    const {
      authenticated, fetchingUnlink, unlinkPlex,
      isFetching,
    } = this.props;

    return (
      <FixedPanel title="Plex" isFetching={isFetching}>
        <div className="flex justify-between">
          {
            !authenticated
              ? this.renderPlexUrl()
              : (
                <div className="flex flex-grow justify-between items-center">
                  Plex Authenticated!
                  <Button onClick={() => unlinkPlex()} className="bg-color-danger py-1 px-2 text-xs">
                    {fetchingUnlink ? 'Unlinking...' : 'Unlink'}
                  </Button>
                </div>
              )
          }
        </div>
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  fetching: state.fetching.plex_login_url,
  plexUrl: state.misc.plex.url,
  authenticated: state.misc.plex.authenticated,
  fetchingUnlink: state.fetching.plex_unlink,
  isFetching: state.fetching.settings,
});

const mapDispatch = {
  getPlexUrl: () => ({ type: Events.SETTINGS_PLEX_LOGIN_URL }),
  checkPlexAuthenticated: () => ({ type: Events.SETTINGS_CHECK_PLEX_AUTHENTICATED }),
  startPolling: () => ({ type: Events.START_API_POLLING, payload: { type: 'plex-auth' } }),
  stopPolling: () => ({ type: Events.STOP_API_POLLING, payload: { type: 'plex-auth' } }),
  unlinkPlex: () => ({ type: Events.SETTINGS_UNLINK_PLEX }),
  clearPlexUrl: () => (setMiscItem({ plex: { url: '' } })),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(PlexSettings);
