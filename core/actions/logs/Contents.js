import { createAction } from 'redux-actions';

export const SET_CONTENTS = 'LOGS_SET_CONTENTS';
export const setContents = createAction(SET_CONTENTS);
export const APPEND_CONTENTS = 'LOGS_APPEND_CONTENTS';
export const appendContents = createAction(APPEND_CONTENTS);
