import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
// oxlint-disable-next-line import/default
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

// oxlint-disable-next-line no-restricted-globals
self.MonacoEnvironment = {
  getWorker() {
    // oxlint-disable-next-line new-cap
    return new editorWorker();
  },
};

loader.config({ monaco });
