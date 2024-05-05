import React, { useMemo } from 'react';

// The question marks are there because people can't spell…
const RemoveSummaryRegex = /\b(Sour?ce|Note|Summ?ary):([^\r\n]+|$)/mg;

const MultiSpacesRegex = /\s{2,}/g;

const CleanMiscLinesRegex = /^(\*|--|~) /sg;

const CleanMultiEmptyLinesRegex = /\n{2,}/sg;

// eslint-disable-next-line operator-linebreak -- Because dprint and eslint can't agree otherwise. Feel free to fix it.
const LinkRegex =
  /(?<url>http:\/\/anidb\.net\/(?<type>ch|cr|[feat]|(?:character|creator|file|episode|anime|tag)\/)(?<id>\d+)) \[(?<text>[^\]]+)]/g;

const AnidbDescription = React.memo(({ className, text }: { text: string, className?: string }) => {
  const modifiedText = useMemo(() => {
    const cleanedText = text
      .replaceAll(CleanMiscLinesRegex, '')
      .replaceAll(RemoveSummaryRegex, '')
      .replaceAll(CleanMultiEmptyLinesRegex, '\n')
      .replaceAll(MultiSpacesRegex, ' ');

    const lines = [] as React.ReactNode[];
    let prevPos = 0;
    let pos = 0;
    let link = LinkRegex.exec(cleanedText);
    while (link !== null) {
      pos = link.index;
      lines.push(cleanedText.substring(prevPos, pos));
      prevPos = pos + link[0].length;
      lines.push(
        link.groups!.text,
      );
      link = LinkRegex.exec(cleanedText);
    }

    if (prevPos < cleanedText.length) {
      lines.push(cleanedText.substring(prevPos));
    }
    LinkRegex.lastIndex = 0;
    return lines.join('');
  }, [text]);
  return <div className={className ?? 'pr-4 text-base'}>{modifiedText}</div>;
});

export default AnidbDescription;
