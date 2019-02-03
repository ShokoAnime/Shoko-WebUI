// @flow
import { createAction } from 'redux-actions';

export const SET_STATUS = 'MODALS_QUICK_ACTIONS_SET_STATUS';
export const setStatus = createAction(SET_STATUS);

export const SET_ACTION = 'MODALS_QUICK_ACTIONS_SET_ACTION';
export const setAction = createAction(SET_ACTION);
