import React from 'react';
import { mdiAccount } from '@mdi/js';
import { Icon } from '@mdi/react';

const charRegex = new RegExp(
  '(http:\\/\\/anidb.net\\/c(?:h|r)[0-9]+) \\[([^\\]]+)]',
  'g',
);

const AnidbLink = ({ url, character, text }) => (
  <span className="text-highlight-1" title={url}>
    {character === true ? <Icon className="inline-block" path={mdiAccount} size={1} /> : null}{' '}
    {text}
  </span>
);

const AnidbDescription = ({ text }) => {

  const lines = [] as Array<JSX.Element>;
  let prevPos = 0;
  let pos = 0;
  let link = charRegex.exec(text);
  
  while (link !== null) {
    pos = link.index;
    lines.push(text.substring(prevPos, pos));
    prevPos = pos + link[0].length;
    lines.push(
      <AnidbLink key={pos} character url={link[1]} text={link[2]} />,
    );
    link = charRegex.exec(text);
  }

  if (prevPos < text.length) {
    lines.push(text.substring(prevPos));
  }
  
  return (
    <div>{lines}</div>
  );
};

export default React.memo(AnidbDescription);