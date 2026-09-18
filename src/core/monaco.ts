import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
// oxlint-disable-next-line import/default -- the Vite ?worker import has no default export in the type declarations
import editorWorker from 'monaco-editor/editor/editor.worker?worker';

// oxlint-disable-next-line no-restricted-globals -- MonacoEnvironment must be assigned on the global scope for the editor loader
self.MonacoEnvironment = {
  getWorker() {
    // oxlint-disable-next-line new-cap -- the ?worker import generates a lowercase-named constructor
    return new editorWorker();
  },
};

loader.config({ monaco });
