import React from 'react';
import { Editor } from '@monaco-editor/react';

// To import custom monaco config
import '@/core/monaco';

type Props = {
  defaultLanguage: string;
  value: string;
  onChange: (value: string) => void;
};

const RenamerEditor = ({ defaultLanguage, onChange, value }: Props) => (
  <Editor
    defaultLanguage={defaultLanguage}
    value={value}
    onChange={onChange}
    theme="vs-dark"
  />
);

export default RenamerEditor;
