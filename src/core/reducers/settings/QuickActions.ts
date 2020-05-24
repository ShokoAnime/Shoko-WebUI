
import { handleAction } from 'redux-actions';
import { SETTINGS_QUICK_ACTION_SET } from '../../actions/settings/QuickActions';
import { Action } from '../../actions';

type StateType = Array<string>;
export type QuickActionPayloadType = {
  id: string;
  slot: number;
};
export type ActionType = Action & {
  payload: QuickActionPayloadType;
};

const defaultState = ['folder-import', 'remove-missing-files', 'stats-update', 'mediainfo-update', 'plex-sync'];

const quickActions = handleAction(
  SETTINGS_QUICK_ACTION_SET, (state: StateType, action: ActionType): StateType => {
    const {
      payload,
    } = action;
    if (!payload.slot || !payload.id) { return state; }
    const newState = state.slice(0);
    newState[payload.slot] = payload.id;
    return newState;
  }, defaultState,
);

export default quickActions;
