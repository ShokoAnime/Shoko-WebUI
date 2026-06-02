import React from 'react';
import { Editor } from '@monaco-editor/react';

// To import custom monaco config
import '@/core/monaco';

type Props = {
  language: string;
  onChange: (value: string) => void;
  value: string;
};

const CodeEditor = ({ language, onChange, value }: Props) => (
  <Editor
    defaultLanguage={language}
    onChange={onChange}
    theme="vs-dark"
    value={value}
  />
);

export default CodeEditor;
