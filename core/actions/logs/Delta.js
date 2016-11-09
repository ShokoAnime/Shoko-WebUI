import { forEach } from 'lodash';
import { createAsyncAction } from '../../actions';

export const GET_DELTA = 'LOGS_GET_DELTA';
export const getDeltaAsync = createAsyncAction(GET_DELTA, 'logs.delta', '/log/get/', (response) => {
  if (response.status !== 200) {
    return new Error(`Response status: ${response.status}`);
  }
  return response.json().then((json) => {
    try {
      const lines = [];
      let currentLine = null;
      const logRegex = /^\[([0-9-]+\s{1}[0-9:]+)]\s(\w+)\|(.*)/g;
      forEach(json.lines, (line) => {
        logRegex.lastIndex = 0;
        const tags = logRegex.exec(line);
        if (tags !== null) {
          if (currentLine !== null) {
            lines.push(currentLine);
          }
          currentLine = Object.assign({}, {
            stamp: tags[1],
            tag: tags[2],
            text: tags[3],
          });
        } else {
          if (currentLine === null) {
            currentLine = Object.assign({}, {
              stamp: null,
              tag: null,
              text: tags !== null ? line : '',
            });
          }
          currentLine.text += line;
        }
      });
      if (currentLine !== null) {
        lines.push(currentLine);
      }

      return Object.assign({}, json, { lines });
    } catch (ex) {
      return new Error(ex.message);
    }
  });
});
