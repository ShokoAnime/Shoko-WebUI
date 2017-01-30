import { combineReducers } from 'redux';
import { contents } from './logs/Contents';
import { filters, keyword } from './logs/Filters';

export default combineReducers({
  contents,
  filters,
  keyword,
});
