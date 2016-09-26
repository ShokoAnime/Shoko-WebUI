import { createApiReducer } from '../../reducers';
import { GET_LOG, SET_LOG } from '../../actions/settings/Log';

export const logs = createApiReducer(GET_LOG);
export const setLogs = createApiReducer(SET_LOG);
