import React, { useMemo } from 'react';
import cx from 'classnames';
import { trim } from 'lodash';

import { useSettingsQuery } from '@/core/react-query/settings/queries';

// The question marks are there because people can't spell…
// eslint-disable-next-line @stylistic/operator-linebreak -- Because dprint and eslint can't agree otherwise. Feel free to fix it.
const CleanInfoLinesRegex =
  /\(?\b((Modified )?Sour?ces?|Note( [1-9])?|Summ?ary|From|See Also):(?!$| a daikon)([^\r\n]+|$)/img;

// eslint-disable-next-line @stylistic/operator-linebreak -- Because dprint and eslint can't agree otherwise. Feel free to fix it.
const CleanMiscLinesRegex =
  /^(\*|[\u2014~-] (adapted|source|description|summary|translated|written):?) ([^\r\n]+|$)/img;

// This accounts for an AniDB API bug since BBCode is not supposed to be there
const CleanBBCodeContentsRegex = /\[i\](?!"The Sasami|"Stellar|In the distant| occurred in)(.*?)\[\/i\]/isg;
const CleanBBCodeTagsRegex = /\[\/?i\]/g;

const CleanMultiEmptyLinesRegex = /\n{2,}/g;

const CleanMultiSpacesRegex = /\s{2,}/g;

// eslint-disable-next-line @stylistic/operator-linebreak -- Because dprint and eslint can't agree otherwise. Feel free to fix it.
const LinkRegex =
  /(?<url>http:\/\/anidb\.net\/(?<type>ch|co|cr|[feast]|(?:character|creator|file|episode|anime|tag)\/)(?<id>\d+)) \[(?<text>[^\]]+)]/g;

type Props = {
  className?: string;
  text: string;
  altText?: string;
};

const CleanDescription = React.memo(({ altText, className, text }: Props) => {
  const settings = useSettingsQuery().data;
  const filterDescription = settings?.WebUI_Settings.collection.anidb.filterDescription;

  const modifiedText = useMemo(() => {
    let cleanedText: string;
    if (filterDescription) {
      cleanedText = text
        .replaceAll(CleanInfoLinesRegex, '')
        .replaceAll(CleanMiscLinesRegex, '')
        .replaceAll(CleanBBCodeContentsRegex, '')
        .replaceAll(CleanBBCodeTagsRegex, '')
        .replaceAll(CleanMultiEmptyLinesRegex, '\n')
        .replaceAll(CleanMultiSpacesRegex, ' ');
    } else {
      cleanedText = text
        .replaceAll(CleanBBCodeTagsRegex, '')
        .replaceAll(CleanMultiEmptyLinesRegex, '\n')
        .replaceAll(CleanMultiSpacesRegex, ' ');
    }

    const lines: string[] = [];
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
    return trim(lines.join(''), '\n ');
  }, [text, filterDescription]);

  // Fallback to alt text if modified text is empty
  if (modifiedText === '') {
    return <CleanDescription className={className} text={altText ?? 'Description Not Available.'} />;
  }

  return <div className={cx(className, 'pr-4 text-base whitespace-pre-line')}>{modifiedText}</div>;
});

export default CleanDescription;
