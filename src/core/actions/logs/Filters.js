// @flow
import { createAction } from 'redux-actions';

export const SET_FILTERS = 'LOGS_SET_FILTERS';
export const setFilters = createAction(SET_FILTERS);
export const SET_KEYWORD = 'LOGS_SET_KEYWORD';
export const setKeyword = createAction(SET_KEYWORD);
