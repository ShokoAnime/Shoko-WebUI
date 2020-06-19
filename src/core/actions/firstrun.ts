import { createAction } from 'redux-actions';

export const FIRSTRUN_STATUS = 'FIRSTRUN_STATUS';
export const getStatus = createAction(FIRSTRUN_STATUS);

export const FIRSTRUN_DATABASE = 'FIRSTRUN_DATABASE';
export const getDatabase = createAction(FIRSTRUN_DATABASE);

export const FIRSTRUN_ANIDB = 'FIRSTRUN_ANIDB';
export const getAnidb = createAction(FIRSTRUN_ANIDB);

export const FIRSTRUN_USER = 'FIRSTRUN_USER';
export const getUser = createAction(FIRSTRUN_USER);

export const FIRSTRUN_ACTIVE_TAB = 'FIRSTRUN_ACTIVE_TAB';
export const activeTab = createAction(FIRSTRUN_ACTIVE_TAB);
