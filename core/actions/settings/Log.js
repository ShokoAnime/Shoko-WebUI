import { createAsyncAction, createAsyncPostAction } from '../../actions';

export const GET_LOG = 'SETTINGS_GET_LOG';
export const getLog = createAsyncAction(GET_LOG, 'logs', '/log/rotate');
export const SET_LOG = 'SETTINGS_SET_LOG';
export const setLog = createAsyncPostAction(SET_LOG, 'setLogs', '/log/rotate');
