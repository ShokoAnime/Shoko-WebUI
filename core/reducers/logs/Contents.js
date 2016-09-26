import { handleActions } from 'redux-actions';
import { concat } from 'lodash';
import { SET_CONTENTS, APPEND_CONTENTS } from '../../actions/logs/Contents';

const defaultState = {
  lines: [],
  position: 0,
};

export const contents = handleActions({
  [SET_CONTENTS]: (state, action) => {
    if (action.error) { return state; }
    const lines = action.payload.lines || [];
    return Object.assign({}, state, { lines });
  },
  [APPEND_CONTENTS]: (state, action) => {
    if (action.error) { return state; }
    const lines = concat(state.lines, action.payload);
    return Object.assign({}, state, { lines });
  },
}, defaultState);

export default {};
