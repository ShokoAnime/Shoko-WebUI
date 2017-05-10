// @flow
import { createAction } from 'redux-actions';

export const SET_UPDATE_CHANNEL = 'SETTINGS_SET_UPDATE_CHANNEL';
export const setUpdateChannel = createAction(SET_UPDATE_CHANNEL);
export const SET_LOG_DELTA = 'SETTINGS_SET_LOG_DELTA';
export const setLogDelta = createAction(SET_LOG_DELTA);
