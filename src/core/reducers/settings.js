// @flow
import { combineReducers } from 'redux';
import { logs } from './settings/Log';
import ui from './settings/UI';
import other from './settings/Other';
import json from './settings/Json';
import server from './settings/Server';

export default combineReducers({
  logs,
  ui,
  other,
  json,
  server,
});
