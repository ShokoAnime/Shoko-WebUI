import React, { useMemo } from 'react';
import cx from 'classnames';

// The question marks are there because people can't spell…
const CleanInfoLinesRegex = /\b((Modified )?Sour?ce|Note( [1-9])?|Summ?ary):(?!$)([^\r\n]+|$)/img;

// eslint-disable-next-line operator-linebreak -- Because dprint and eslint can't agree otherwise. Feel free to fix it.
const CleanMiscLinesRegex =
  /^^(\*|\u2014 (adapted|source:?|summary|translated|written)|- (translated)|~ (adapted|description|summary|translated)) ([^\r\n]+|$)/img;

// This accounts for an AniDB API bug since BBCode is not supposed to be there
const CleanBBCodeRegex = /\[i\](?!"The Sasami|"Stellar|In the distant| occurred in)(.*?)\[\/i\]/isg;
const CleanExtraBBCodeRegex = /(\[i\]|\[\/i\])/ig;

const CleanMultiEmptyLinesRegex = /\n{2,}/g;

const CleanMultiSpacesRegex = /\s{2,}/g;

// eslint-disable-next-line operator-linebreak -- Because dprint and eslint can't agree otherwise. Feel free to fix it.
const LinkRegex =
  /(?<url>http:\/\/anidb\.net\/(?<type>ch|co|cr|[feast]|(?:character|creator|file|episode|anime|tag)\/)(?<id>\d+)) \[(?<text>[^\]]+)]/ig;

type Props = {
  className?: string;
  text: string;
  altText?: string;
};

const CleanDescription = React.memo(({ altText, className, text }: Props) => {
  const modifiedText = useMemo(() => {
    const cleanedText = text
      .replaceAll(CleanInfoLinesRegex, '')
      .replaceAll(CleanMiscLinesRegex, '')
      .replaceAll(CleanBBCodeRegex, '')
      .replaceAll(CleanExtraBBCodeRegex, '')
      .replaceAll(CleanMultiEmptyLinesRegex, '\n')
      .replaceAll(CleanMultiSpacesRegex, ' ');

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

  // Fallback to alt text if modified text is empty
  if (modifiedText === '') {
    return <CleanDescription className={className} text={altText ?? 'Description Not Available.'} />;
  }

  return <div className={cx(className, 'pr-4 text-base')}>{modifiedText}</div>;
});

export default CleanDescription;
