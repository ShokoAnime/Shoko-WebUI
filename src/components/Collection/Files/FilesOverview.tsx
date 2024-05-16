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
  const formattedSources = sourceMap.length > 0 ? sourceMap.join(', ') : 'N/A';
  return (
    <>
      <div className="flex flex-col gap-y-1">
        <span className="font-semibold">
          {formattedType}
          &nbsp;Count
        </span>
        <span className="font-normal">{typeCount}</span>
      </div>
      <div className="flex flex-col gap-y-1">
        <span className="font-semibold">
          {formattedType}
          &nbsp;Source
        </span>
        <span className="font-normal">{formattedSources}</span>
      </div>
    </>
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
        <span className="font-semibold">Total File Size</span>
        {prettyBytes(overview?.TotalFileSize ?? 0, { binary: true })}
      </div>
      <div className="flex flex-col gap-y-1">
        <span className="font-semibold">Groups</span>
        {releaseGroups}
      </div>
    </ShokoPanel>
  );
};

export default FileOverview;
