import React from 'react';
import type { ReactNode } from 'react';
import type { Options } from 'react-markdown';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

type Props = Readonly<Options> & {
  children: ReactNode;
};

const defaultComponents = {};

const ShokoMarkdown = ({ children, components = defaultComponents, ...options }: Props) => (
  <Markdown
    remarkPlugins={[remarkGfm, remarkBreaks]}
    components={{
      a: ({ node: _node, ...rest }) => (
        <a className="text-panel-text-primary" target="_blank" rel="noopener noreferrer" {...rest} />
      ),
      ul: ({ node: _node, ...rest }) => <ul className="ml-4 list-disc" {...rest} />,
      ...components,
    }}
    {...options}
  >
    {children}
  </Markdown>
);

export default ShokoMarkdown;
