import { handleAction } from 'redux-actions';
import { GET_DELTA } from '../../actions/logs/Delta';

export const delta = handleAction(GET_DELTA,
  (state, action) => (action.error ? state : action.payload), {});

export default {};
