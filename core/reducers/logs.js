import { combineReducers } from 'redux';
import { contents } from './logs/Contents';
import { delta } from './logs/Delta';
import { filters, keyword } from './logs/Filters';

export default combineReducers({
  contents,
  delta,
  filters,
  keyword,
});
