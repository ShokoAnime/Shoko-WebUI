import React, { useMemo } from 'react';
import prettyBytes from 'pretty-bytes';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { EpisodeTypeEnum } from '@/core/types/api/episode';

import type { WebuiSeriesFileSummaryOverview, WebuiSeriesFileSummarySourceCount } from '@/core/types/api/webui';

type FileTypeSummaryProps = {
  sources: WebuiSeriesFileSummarySourceCount[];
  type: EpisodeTypeEnum;
};
const FileTypeSummary = ({ sources, type }: FileTypeSummaryProps) => {
  const formattedType = (type === EpisodeTypeEnum.Normal) ? 'Episode' : type;
  const typeCount = sources.reduce((prev, curr) => (prev + curr.Count), 0);
  const sourceMap = sources.map(({ Count, Type }) => (`${Type} (${Count})`));
  return (
    <div className="flex flex-col gap-y-1">
      <span className="font-bold">
        {formattedType}
        s&nbsp;
        {sourceMap.length > 1
          && (
            <span className="opacity-65">
              (
              {typeCount}
              )
            </span>
          )}
      </span>
      <span className="font-normal">
        {sourceMap.map((source, index) => (
          // eslint-disable-next-line react/no-array-index-key -- will not change between renders
          <React.Fragment key={index}>
            {source}
            <br />
          </React.Fragment>
        ))}
      </span>
    </div>
  );
};

type Props = {
  overview?: WebuiSeriesFileSummaryOverview;
};
const FileOverview = ({ overview }: Props) => {
  const releaseGroups = useMemo(() => {
    const groupSet = new Set();
    overview?.ReleaseGroups.forEach(groupName => groupSet.add(groupName));

    return (groupSet.size === 0) ? 'N/A' : [...groupSet].join(', ');
  }, [overview?.ReleaseGroups]);

  const fileTypeSummaries = useMemo(() => (
    overview?.SourcesByType.map(({ Sources, Type }) => <FileTypeSummary type={Type} sources={Sources} key={Type} />)
  ), [overview?.SourcesByType]);
  return (
    <ShokoPanel
      title="Files Overview"
      className="w-400 shrink-0 grow"
      contentClassName="gap-y-6"
      transparent
      sticky
      fullHeight={false}
    >
      {fileTypeSummaries}
      <div className="flex flex-col gap-y-1">
        <span className="font-bold">Total File Size</span>
        {prettyBytes(overview?.TotalFileSize ?? 0, { binary: true })}
      </div>
      <div className="flex flex-col gap-y-1">
        <span className="font-bold">Groups</span>
        {releaseGroups}
      </div>
    </ShokoPanel>
  );
};

export default FileOverview;
