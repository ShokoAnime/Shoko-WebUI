import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { map, omit } from 'lodash';
import prettyBytes from 'pretty-bytes';

import type { WebuiSeriesFileSummaryGroupRangeByType, WebuiSeriesFileSummaryGroupType } from '@/core/types/api/webui';

type HeaderFragmentProps = {
  range?: string;
  title?: string;
};
const HeaderFragment = ({ range, title }: HeaderFragmentProps) => {
  if (!title || !range) return null;
  return (
    <>
      <span>{title}</span>
      <span className="text-panel-text-important">{range}</span>
    </>
  );
};

type HeaderProps = {
  ranges: WebuiSeriesFileSummaryGroupRangeByType;
};
const Header = ({ ranges }: HeaderProps) => {
  const { t } = useTranslation('files');
  return (
    <div className="flex gap-x-2">
      <HeaderFragment
        title={ranges?.Normal ? t('episodeType.normal', { count: ranges.Normal.Count || 1 }) : undefined}
        range={ranges?.Normal?.Range}
      />
      <HeaderFragment
        title={ranges?.Special ? t('episodeType.special', { count: ranges.Special.Count || 1 }) : undefined}
        range={ranges?.Special?.Range}
      />
      {map(omit(ranges, ['Normal', 'Special']), (item, key) => (
        <HeaderFragment
          key={key}
          title={t(`episodeType.${key.toLowerCase()}`, {
            count: item.Count || 1,
          })}
          range={item.Range}
        />
      ))}
    </div>
  );
};

type RowProps = {
  label: string;
  value: string;
};
const Row = ({ label, value }: RowProps) => (
  <div className="flex gap-x-12">
    <div className="w-20 shrink-0 font-semibold">
      {label}
    </div>
    <div className="max-w-[33rem] break-words">
      {value}
    </div>
  </div>
);

type GroupProps = {
  group: WebuiSeriesFileSummaryGroupType;
};
const Group = ({ group }: GroupProps) => {
  const { t } = useTranslation('files');
  const sizes = useMemo(() => {
    const parts = map(group.RangeByType, (item, key) => {
      if (!item.Count || item.Count === 0) return null;

      const typeKey = key.toLowerCase(); // Normal → normal, Credit → credit ...
      const title = t(`episodeType.${typeKey}`, {
        count: item.Count ?? 1,
        // 已提供所有类型的 _one / _other，无需 defaultValue
      });

      return `${item.Count} ${title} (${prettyBytes(item.FileSize, { binary: true })})`;
    }).filter(Boolean);

    return parts.length > 0 ? parts.join(' | ') : t('unknown');
  }, [group, t]);

  const groupDetails = useMemo(
    () => (group.GroupName ? `${group.GroupName} (${group.GroupNameShort})` : t('unknown')),
    [group, t],
  );
  const videoDetails = useMemo(() => {
    const conditions: string[] = [];
    if (group.FileSource) {
      conditions.push(group.FileSource.replace('BluRay', t('bluRay')));
    }
    if (group.FileVersion) {
      conditions.push(`v${group.FileVersion}`);
    }
    if (group.VideoBitDepth) {
      conditions.push(`${group.VideoBitDepth}-bit`);
    }
    if (group.VideoResolution) {
      conditions.push(`${group.VideoResolution} (${group.VideoWidth}x${group.VideoHeight})`);
    }
    if (group.VideoCodecs) {
      conditions.push(group.VideoCodecs);
    }
    return conditions.length ? conditions.join(' | ') : t('unknown');
  }, [group, t]);
  const audioDetails = useMemo(() => {
    const conditions: string[] = [];
    if (group.AudioCodecs) {
      conditions.push(group.AudioCodecs.toUpperCase());
    }
    if (group.AudioLanguages) {
      const langStr = group.AudioLanguages.join(', ');
      if (group.AudioStreamCount !== undefined) {
        conditions.push(`${t('multiAudio')} (${langStr})`);
      } else {
        conditions.push(langStr);
      }
    }
    return conditions.length ? conditions.join(' | ') : t('unknown');
  }, [group, t]);
  const subtitleDetails = useMemo(() => {
    const conditions: string[] = [];
    if (group.SubtitleCodecs) {
      conditions.push(group.SubtitleCodecs.toUpperCase());
    }
    if (group.SubtitleLanguages) {
      const langStr = group.SubtitleLanguages.join(', ');
      if (group.SubtitleStreamCount !== undefined) {
        conditions.push(`${t('multiSubtitle')} (${langStr})`);
      } else {
        conditions.push(langStr);
      }
    }
    return conditions.length ? conditions.join(' | ') : t('unknown');
  }, [group, t]);
  const locationDetails = group.FileLocation ?? t('unknown');

  return (
    <div className="flex flex-col gap-y-6 rounded border border-panel-border bg-panel-background-transparent p-6">
      <div className="flex text-xl font-semibold">
        <Header ranges={group.RangeByType} />
      </div>
      <div className="flex gap-x-[4.5rem]">
        <div className="flex flex-col gap-y-2">
          <Row label={t('row.group')} value={groupDetails} />
          <Row label={t('row.video')} value={videoDetails} />
          <Row label={t('row.location')} value={locationDetails} />
        </div>
        <div className="flex flex-col gap-y-2">
          <Row label={t('row.total')} value={sizes} />
          <Row label={t('row.audio')} value={audioDetails} />
          <Row label={t('row.subtitles')} value={subtitleDetails} />
        </div>
      </div>
    </div>
  );
};

type Props = {
  groups?: WebuiSeriesFileSummaryGroupType[];
};
const FilesSummaryGroups = React.memo(({ groups = [] }: Props) => (
  // eslint-disable-next-line react/no-array-index-key
  groups.map((group, index) => <Group key={index} group={group} />)
));

export default FilesSummaryGroups;
