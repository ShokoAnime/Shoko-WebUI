import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import prettyBytes from 'pretty-bytes';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { EpisodeTypeEnum } from '@/core/types/api/episode';

import type { WebuiSeriesFileSummaryOverview, WebuiSeriesFileSummarySourceCount } from '@/core/types/api/webui';

type FileTypeSummaryProps = {
  sources: WebuiSeriesFileSummarySourceCount[];
  type: EpisodeTypeEnum;
};
const FileTypeSummary = ({ sources, type }: FileTypeSummaryProps) => {
  const { t } = useTranslation('files');
  const typeCount = sources.reduce((prev, curr) => prev + curr.Count, 0);
  // 如果该类型文件总数为 0，直接不渲染（避免显示空总结）
  if (typeCount === 0) return null;

  const typeKey = type === EpisodeTypeEnum.Normal ? 'normal' : type.toLowerCase();

  // 正确使用 i18next plural：传入真实 count，无 defaultValue，无 hack
  const formattedType = t(`episodeType.${typeKey}`, { count: typeCount });

  const sourceMap = sources.map(({ Count, Type }) => `${Type} (${Count})`);

  return (
    <div className="flex flex-col gap-y-1">
      <span className="font-bold">
        {formattedType}
        &nbsp;
        {sourceMap.length > 1 && (
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
  const { t } = useTranslation('files');
  const releaseGroups = useMemo(() => {
    const groupSet = new Set();
    overview?.ReleaseGroups.forEach(groupName => groupSet.add(groupName));

    return (groupSet.size === 0) ? t('overview.na') : [...groupSet].join(', ');
  }, [overview?.ReleaseGroups, t]);

  const fileTypeSummaries = useMemo(() => (
    overview?.SourcesByType.map(({ Sources, Type }) => <FileTypeSummary type={Type} sources={Sources} key={Type} />)
  ), [overview?.SourcesByType]);
  return (
    <ShokoPanel
      title={t('overview.title')}
      className="w-100 shrink-0 grow"
      contentClassName="gap-y-6"
      transparent
      sticky
      fullHeight={false}
    >
      {fileTypeSummaries}
      <div className="flex flex-col gap-y-1">
        <span className="font-bold">{t('overview.totalFileSize')}</span>
        {prettyBytes(overview?.TotalFileSize ?? 0, { binary: true })}
      </div>
      <div className="flex flex-col gap-y-1">
        <span className="font-bold">{t('overview.groups')}</span>
        {releaseGroups}
      </div>
    </ShokoPanel>
  );
};

export default FileOverview;
