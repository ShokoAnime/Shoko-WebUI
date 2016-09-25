import { createAsyncAction } from '../../actions';

export const GET_DELTA = 'LOGS_GET_DELTA';
export const getDeltaAsync = createAsyncAction(GET_DELTA, 'logs.delta', '/log/get/');
