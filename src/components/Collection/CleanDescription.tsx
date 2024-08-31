import React, { useMemo } from 'react';
import cx from 'classnames';

// The question marks are there because people can't spell…
const RemoveSummaryRegex = /\b(Sour?ce|Note|Summ?ary):([^\r\n]+|$)/mg;

const RemoveBasedOnWrittenByRegex = /^(\*|\u2014) (based on|written by) ([^\r\n]+|$)/img;

const RemoveBBCodeRegex = /\[i\](.*?)\[\/i\]/sg;

const MultiSpacesRegex = /\s{2,}/g;

const CleanMiscLinesRegex = /^(--|~) /sg;

const CleanMultiEmptyLinesRegex = /\n{2,}/sg;

// eslint-disable-next-line operator-linebreak -- Because dprint and eslint can't agree otherwise. Feel free to fix it.
const LinkRegex =
  /(?<url>http:\/\/anidb\.net\/(?<type>ch|cr|[feat]|(?:character|creator|file|episode|anime|tag)\/)(?<id>\d+)) \[(?<text>[^\]]+)]/g;

type Props = {
  className?: string;
  text: string;
  altText?: string;
};

const CleanDescription = React.memo(({ altText, className, text }: Props) => {
  const modifiedText = useMemo(() => {
    const cleanedText = text
      .replaceAll(CleanMiscLinesRegex, '')
      .replaceAll(RemoveSummaryRegex, '')
      .replaceAll(RemoveBasedOnWrittenByRegex, '')
      .replaceAll(RemoveBBCodeRegex, '')
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

  // Fallback to alt text if modified text is empty
  if (modifiedText === '') {
    return <CleanDescription className={className} text={altText ?? 'Description Not Available.'} />;
  }

  return <div className={cx(className, 'pr-4 text-base')}>{modifiedText}</div>;
});

export default CleanDescription;
