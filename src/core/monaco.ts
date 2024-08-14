/* eslint-disable new-cap */
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import 'monaco-editor/esm/vs/basic-languages/lua/lua.contribution';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution';
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution';

// eslint-disable-next-line no-restricted-globals
self.MonacoEnvironment = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getWorker(_, label) {
    // if (label === 'json') {
    //   return new jsonWorker();
    // }
    // if (label === 'typescript' || label === 'javascript') {
    //   return new tsWorker();
    // }
    return new editorWorker();
  },
};

loader.config({ monaco });
