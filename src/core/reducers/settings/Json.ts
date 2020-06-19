import { handleAction } from 'redux-actions';
import { SETTINGS_JSON } from '../../actions/settings/Json';

const json = handleAction(SETTINGS_JSON, (state, action) => (action.error ? state : (action.payload || '')), '');

export default json;
