import React, { useMemo } from 'react';

const RemoveSummaryRegex = /^\n(Source|Note|Summary):.*/mg;
const CleanMiscLinesRegex = /^(\*|--|~) /sg;
const CleanMultiEmptyLinesRegex = /\n{2,}/sg;
const LinkRegex = /(?<url>http:\/\/anidb\.net\/(?<type>ch|cr|[feat])(?<id>\d+)) \[(?<text>[^\]]+)]/g;

const AnidbDescription = ({ text }: { text: string }) => {
  const modifiedText = useMemo(() => {
    const cleanedText = text
      .replaceAll(CleanMiscLinesRegex, '')
      .replaceAll(RemoveSummaryRegex, '')
      .replaceAll(CleanMultiEmptyLinesRegex, '\n');

    const lines = [] as React.ReactNode[];
    let prevPos = 0;
    let pos = 0;
    let link = LinkRegex.exec(cleanedText);
    while (link !== null) {
      pos = link.index;
      lines.push(cleanedText.substring(prevPos, pos));
      prevPos = pos + link[0].length;
      lines.push(
        link[4],
      );
      link = LinkRegex.exec(cleanedText);
    }

    if (prevPos < cleanedText.length) {
      lines.push(cleanedText.substring(prevPos));
    }
    LinkRegex.lastIndex = 0;
    return lines.join('');
  }, [text]);
  return <div>{modifiedText}</div>;
};

export default React.memo(AnidbDescription);
