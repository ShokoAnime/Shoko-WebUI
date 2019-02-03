// @flow
import { combineReducers } from 'redux';
import { logs } from './settings/Log';
import ui from './settings/UI';
import other from './settings/Other';
import json from './settings/Json';
import server from './settings/Server';
import trakt from './settings/Trakt';
import plex from './settings/Plex';
import quickActions from './settings/QuickActions';

export default combineReducers({
  logs,
  ui,
  other,
  json,
  server,
  trakt,
  plex,
  quickActions,
});
