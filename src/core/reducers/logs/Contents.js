// @flow
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
    const { position } = action.payload;
    return Object.assign({}, state, { lines, position });
  },
  [APPEND_CONTENTS]: (state, action) => {
    if (action.error) { return state; }
    const { position } = action.payload;
    let lines = [];
    const newLines = action.payload.lines;
    if (newLines.length > 0 && newLines[0].tag === null && state.lines.length > 0) {
      const lastLine = state.lines.pop();
      const newLine = newLines.shift();
      lastLine.text += newLine.text;
      lines = concat(state.lines, [lastLine], newLines);
    } else {
      lines = concat(state.lines, newLines);
    }
    return Object.assign({}, state, { lines, position });
  },
}, defaultState);

export default {};
