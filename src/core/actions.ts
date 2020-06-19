import 'isomorphic-fetch';
import { createAction } from 'redux-actions';

export type Action = {
  type: string;
  payload?: any;
};

/* Sync actions */
export const SIDEBAR_TOGGLE = 'SIDEBAR_TOGGLE';
export const toggleSidebar = createAction(SIDEBAR_TOGGLE);

/* Async actions - API calls */
export const JMM_NEWS = 'JMM_NEWS';
export const UPDATE_AVAILABLE = 'UPDATE_AVAILABLE';
export const JMM_VERSION = 'JMM_VERSION';

/* Timer */

export const SET_AUTOUPDATE = 'SET_AUTOUPDATE';
