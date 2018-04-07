// @flow
import { handleAction } from 'redux-actions';
import { SETTINGS_TRAKT } from '../../actions/settings/Trakt';
import type { Action } from '../../actions';

export type SettingsTraktType = {
  usercode: string,
  url: string,
}

const defaultState = {
  usercode: '',
  url: '',
};

const trakt = handleAction(
  SETTINGS_TRAKT,
  (state: SettingsTraktType, action: Action): SettingsTraktType =>
    Object.assign({}, state, action.payload),
  defaultState,
);

export default trakt;
