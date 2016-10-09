import { combineReducers } from 'redux';
import { logs } from './settings/Log';
import ui from './settings/UI';
import other from './settings/Other';

export default combineReducers({
  logs,
  ui,
  other,
});
