import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

// eslint-disable-next-line no-restricted-globals
self.MonacoEnvironment = {
  getWorker() {
    // eslint-disable-next-line new-cap
    return new editorWorker();
  },
};

loader.config({ monaco });
