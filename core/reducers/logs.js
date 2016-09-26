import { combineReducers } from 'redux';
import { contents } from './logs/Contents';
import { delta } from './logs/Delta';

export default combineReducers({
  contents,
  delta,
});
