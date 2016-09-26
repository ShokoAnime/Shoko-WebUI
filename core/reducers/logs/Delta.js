import { createApiReducer } from '../../reducers';
import { GET_DELTA } from '../../actions/logs/Delta';

export const delta = createApiReducer(GET_DELTA);

export default {};
