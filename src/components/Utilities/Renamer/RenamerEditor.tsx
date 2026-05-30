import React from 'react';
import { Editor } from '@monaco-editor/react';

import type { EditorProps } from '@monaco-editor/react';

// To import custom monaco config
import '@/core/monaco';

const RenamerEditor = (props: EditorProps) => {
  const { theme = 'vs-dark', ...rest } = props;
  return (
    <Editor
      {...rest}
      theme={theme}
    />
  );
};

export default RenamerEditor;
