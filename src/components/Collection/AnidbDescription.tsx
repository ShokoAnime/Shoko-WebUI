import React from 'react';

const RemoveSummaryRegex = /^\n(Source|Note|Summary):.*/mg;

const CleanMiscLinesRegex = /^(\*|--|~) /sg;

const CleanMultiEmptyLinesRegex = /\n{2,}/sg;

const LinkRegex = /(?<url>http:\/\/anidb\.net\/(?<type>ch|cr|[feat])(?<id>\d+)) \[(?<text>[^\]]+)]/g;

const AnidbDescription = ({ text }: { text: string | null | undefined }) => {
  const modifiedText = text
    ?.replaceAll(CleanMiscLinesRegex, '')
    .replaceAll(RemoveSummaryRegex, '')
    .replaceAll(CleanMultiEmptyLinesRegex, '\n') ?? '';

  const lines = [] as Array<React.ReactNode>;
  let prevPos = 0;
  let pos = 0;
  let link = LinkRegex.exec(modifiedText);
  while (link !== null) {
    pos = link.index;
    lines.push(modifiedText.substring(prevPos, pos));
    prevPos = pos + link[0].length;
    lines.push(
      link[4],
    );
    link = LinkRegex.exec(modifiedText);
  }

  if (prevPos < modifiedText.length) {
    lines.push(modifiedText.substring(prevPos));
  }
  LinkRegex.lastIndex = 0;
  return <div>{lines.join('')}</div>;
};

export default React.memo(AnidbDescription);
