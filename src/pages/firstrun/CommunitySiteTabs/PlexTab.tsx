import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import Button from '../../../components/Input/Button';

class PlexTab extends React.Component<Props> {
  renderPlexUrl() {
    const {
      fetching, plexUrl, getPlexUrl,
    } = this.props;

    if (plexUrl === '') {
      return (
        <div className="flex w-3/5 justify-between my-1">
          Plex Login:
          <Button onClick={() => getPlexUrl()} className="bg-color-highlight-2 px-2 py-1 text-sm">
            {fetching ? 'Requesting...' : 'Authenticate'}
          </Button>
        </div>
      );
    }
    return (
      <div className="flex justify-between my-1 items-center">
        <span className="w-64">Plex Login URL:</span>
        <span className="color-highlight-2 break-all"><a href={plexUrl} rel="noopener noreferrer" target="_blank">{plexUrl}</a></span><br />
      </div>
    );
  }

  render() {
    const { plexToken } = this.props;

    return (
      <React.Fragment>
        <span className="font-bold">Options</span>
        {
          plexToken === ''
            ? this.renderPlexUrl()
            : (
              <div className="flex w-3/5 justify-between my-1">
                Plex Authenticated:
                <span>Yes</span>
              </div>
            )
        }
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  fetching: state.fetching.plex_login_url,
  plexUrl: state.misc.plex.url,
  plexToken: state.localSettings.Plex.Token,
});

const mapDispatch = {
  getPlexUrl: () => ({ type: Events.SETTINGS_PLEX_LOGIN_URL }),
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(PlexTab);
