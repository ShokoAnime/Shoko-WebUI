import 'isomorphic-fetch';

export type Action = {
  type: string;
  payload?: any;
};

/* Sync actions */

/* Async actions - API calls */
export const JMM_VERSION = 'JMM_VERSION';

/* Timer */

export const SET_AUTOUPDATE = 'SET_AUTOUPDATE';
