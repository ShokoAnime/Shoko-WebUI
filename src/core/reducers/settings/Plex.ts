import { handleAction } from 'redux-actions';
import { SETTINGS_PLEX } from '../../actions/settings/Plex';
import { Action } from '../../actions';

export type SettingsPlexType = {
  url: string;
};

const defaultState = {
  url: '',
};

const plex = handleAction(
  SETTINGS_PLEX, (state: SettingsPlexType, action: Action): SettingsPlexType =>
    Object.assign({}, state, action.payload), defaultState,
);

export default plex;
