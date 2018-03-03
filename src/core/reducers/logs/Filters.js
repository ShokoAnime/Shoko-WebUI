// @flow
import { handleAction } from 'redux-actions';
import { SET_FILTERS, SET_KEYWORD } from '../../actions/logs/Filters';

const defaultFilters = {
  tags: [],
};
export const filters = handleAction(SET_FILTERS, (state, action) => {
  if (action.error) { return state; }
  return Object.assign({}, state, { tags: action.payload || [] });
}, defaultFilters);

export const keyword = handleAction(SET_KEYWORD, (state, action) => {
  if (action.error) { return state; }
  return action.payload || '';
}, '');

export default {};
