import React, { useMemo } from 'react';
import { forEach, map, omit } from 'lodash';
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
const Header = ({ ranges }: HeaderProps) => (
  <div className="flex gap-x-2">
    <HeaderFragment title={ranges?.Normal?.Range.length > 2 ? 'Episodes' : 'Episode'} range={ranges?.Normal?.Range} />
    <HeaderFragment title={ranges?.Normal?.Range.length > 2 ? 'Specials' : 'Special'} range={ranges?.Special?.Range} />
    {map(omit(ranges, ['Normal', 'Special']), (item, key) => <HeaderFragment title={key} range={item.Range} />)}
  </div>
);

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
  const sizes = useMemo(() => {
    const sizeMap: Record<string, { size: number, count: number }> = {};
    forEach(group.RangeByType, (item, key) => {
      let idx = 'Other';
      if (key === 'Normal') {
        idx = item.Count > 1 ? 'Episodes' : 'Episode';
      } else if (key === 'Special') {
        idx = item.Count > 1 ? 'Specials' : 'Special';
      }

      if (!sizeMap[idx]) {
        sizeMap[idx] = { size: 0, count: 0 };
      }
      sizeMap[idx].size += item.FileSize;
      sizeMap[idx].count += item.Count;
    });

    return map(sizeMap, (size, name) => (
      `${size.count} ${name} (${prettyBytes(size.size, { binary: true })})`
    )).join(' | ');
  }, [group]);

  const groupDetails = useMemo(() => (group.GroupName ? `${group.GroupName} (${group.GroupNameShort})` : '-'), [
    group,
  ]);
  const videoDetails = useMemo(() => {
    const conditions: string[] = [];
    if (group.FileSource) {
      conditions.push(group.FileSource.replace('BluRay', 'Blu-Ray'));
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
    return conditions.length ? conditions.join(' | ') : '-';
  }, [group]);
  const audioDetails = useMemo(() => {
    const conditions: string[] = [];
    if (group.AudioCodecs) {
      conditions.push(group.AudioCodecs.toUpperCase());
    }
    if (group.AudioLanguages) {
      if (group.AudioStreamCount !== undefined) {
        conditions.push(`Multi Audio (${group.AudioLanguages.join(', ')})`);
      } else {
        conditions.push(group.AudioLanguages.join(', '));
      }
    }
    return conditions.length ? conditions.join(' | ') : '-';
  }, [group]);
  const subtitleDetails = useMemo(() => {
    const conditions: string[] = [];
    if (group.SubtitleCodecs) {
      conditions.push(group.SubtitleCodecs.toUpperCase());
    }
    if (group.SubtitleLanguages) {
      if (group.SubtitleStreamCount !== undefined) {
        conditions.push(`Multi Audio (${group.SubtitleLanguages.join(', ')})`);
      } else {
        conditions.push(group.SubtitleLanguages.join(', '));
      }
    }
    return conditions.length ? conditions.join(' | ') : '-';
  }, [group]);
  const locationDetails = group.FileLocation ?? '-';

  return (
    <div className="flex flex-col gap-y-6 rounded-sm border border-panel-border bg-panel-background-transparent p-6">
      <div className="flex text-xl font-semibold">
        <Header ranges={group.RangeByType} />
      </div>
      <div className="flex gap-x-[4.5rem]">
        <div className="flex flex-col gap-y-2">
          <Row label="Group" value={groupDetails} />
          <Row label="Video" value={videoDetails} />
          <Row label="Location" value={locationDetails} />
        </div>
        <div className="flex flex-col gap-y-2">
          <Row label="Total" value={sizes} />
          <Row label="Audio" value={audioDetails} />
          <Row label="Subtitles" value={subtitleDetails} />
        </div>
      </div>
    </div>
  );
};

type Props = {
  groups?: WebuiSeriesFileSummaryGroupType[];
};
// eslint-disable-next-line react/prop-types
const FilesSummaryGroups = React.memo(({ groups = [] }: Props) => (
  // eslint-disable-next-line react/no-array-index-key
  groups.map((group, index) => <Group key={index} group={group} />)
));

export default FilesSummaryGroups;
