import cx from 'classnames';
import { trim } from 'lodash';

import { useSettingsQuery } from '@/core/react-query/settings/queries';

// The question marks are there because people can't spell...
const CleanInfoLinesRegex =
  /\(?\b((Modified )?Sour?ces?|Note( [1-9])?|Summ?ary|From|See Also):(?!$| a daikon)([^\r\n]+|$)/img;

const CleanMiscLinesRegex =
  /^(\*|[\u2014~-] (adapted|source|description|summary|translated|written):?) ([^\r\n]+|$)/img;

// This accounts for an AniDB API bug since BBCode is not supposed to be there
const CleanBBCodeContentsRegex = /\[i\](?!"The Sasami|"Stellar|In the distant| occurred in)(.*?)\[\/i\]/isg;
const CleanBBCodeTagsRegex = /\[\/?i\]/g;

const CleanMultiEmptyLinesRegex = /\n{2,}/g;

const CleanMultiSpacesRegex = /\s{2,}/g;

const cleanAniDbDescription = (dirtyText: string, filterDescription: boolean | undefined) => {
  let cleanedText: string;
  if (filterDescription) {
    cleanedText = dirtyText
      .replaceAll(CleanInfoLinesRegex, '')
      .replaceAll(CleanMiscLinesRegex, '')
      .replaceAll(CleanBBCodeContentsRegex, '')
      .replaceAll(CleanBBCodeTagsRegex, '')
      .replaceAll(CleanMultiEmptyLinesRegex, '\n')
      .replaceAll(CleanMultiSpacesRegex, ' ');
  } else {
    cleanedText = dirtyText
      .replaceAll(CleanBBCodeTagsRegex, '')
      .replaceAll(CleanMultiEmptyLinesRegex, '\n')
      .replaceAll(CleanMultiSpacesRegex, ' ');
  }

  const lines: string[] = [];
  let prevPos = 0;
  let pos = 0;
  // Local to each call so the exec loop's lastIndex bookkeeping never leaks across renders.
  const linkRegex =
    /(?<url>http:\/\/anidb\.net\/(?<type>ch|co|cr|[feast]|(?:character|creator|file|episode|anime|tag)\/)(?<id>\d+)) \[(?<text>[^\]]+)]/g;
  let link = linkRegex.exec(cleanedText);
  while (link !== null) {
    pos = link.index;
    lines.push(cleanedText.substring(prevPos, pos));
    prevPos = pos + link[0].length;
    lines.push(
      link.groups!.text,
    );
    link = linkRegex.exec(cleanedText);
  }

  if (prevPos < cleanedText.length) {
    lines.push(cleanedText.substring(prevPos));
  }
  return trim(lines.join(''), '\n ');
};

type Props = {
  className?: string;
  text: string;
  altText?: string;
};

const CleanDescription = ({ altText, className, text }: Props) => {
  const settings = useSettingsQuery().data;
  const filterDescription = settings?.WebUI_Settings.collection.anidb.filterDescription;

  const modifiedText = cleanAniDbDescription(text, filterDescription);

  // Fallback to alt text if modified text is empty
  if (modifiedText === '') {
    return <CleanDescription className={className} text={altText ?? 'Description Not Available.'} />;
  }

  return <div className={cx(className, 'pr-4 text-base whitespace-pre-line')}>{modifiedText}</div>;
};

export default CleanDescription;
