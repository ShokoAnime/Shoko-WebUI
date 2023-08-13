import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { find, forEach, get, map, omit } from 'lodash';
import prettyBytes from 'pretty-bytes';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import Select from '@/components/Input/Select';
import { useLazyGetSeriesFileSummeryQuery } from '@/core/rtkQuery/splitV3Api/webuiApi';
import { WebuiSeriesFileSummaryGroupType } from '@/core/types/api/webui';

const HeaderFragment = ({ range, title }) => {
  if (!title || !range) return null;
  return (
    <>
      <span>{title}</span>
      <span className="text-panel-important">{range}</span>
    </>
  );
};

const Header = ({ ranges }) => (
  <div className="flex gap-x-2">
    <HeaderFragment title={ranges?.Normal?.Range.length > 2 ? 'Episodes' : 'Episode'} range={ranges?.Normal?.Range} />
    <HeaderFragment title={ranges?.Normal?.Range.length > 2 ? 'Specials' : 'Special'} range={ranges?.Special?.Range} />
    {map(omit(ranges, ['Normal', 'Special']), (item, key) => <HeaderFragment title={key} range={item.Range} />)}
  </div>
);

const SummaryGroup = React.memo(({ group }: { group: WebuiSeriesFileSummaryGroupType }) => {
  const sizes = useMemo(() => {
    const sizeMap: Record<string, { size: number; count: number; }> = {};
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

  const groupDetails = useMemo(() => (group.GroupName ? `${group.GroupName} (${group.GroupNameShort})` : '-'), [group]);
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
    <div className="flex flex-col p-8 rounded border-panel-border border gap-y-8">
      <div className="flex font-semibold text-xl"><Header ranges={group.RangeByType} /></div>
      <div className="flex">
        <div className="grow flex flex-col gap-y-4 font-semibold">
          <span>Group</span>
          <span>Video</span>
          <span>Location</span>
        </div>
        <div className="grow-[2] flex flex-col gap-y-4">
          <span>{groupDetails}</span>
          <span>{videoDetails}</span>
          <span>{locationDetails}</span>
        </div>
        <div className="grow flex flex-col gap-y-4 font-semibold">
          <span>Total</span>
          <span>Audio</span>
          <span>Subtitles</span>
        </div>
        <div className="grow-[2] flex flex-col gap-y-4">
          <span>{sizes}</span>
          <span>{audioDetails}</span>
          <span>{subtitleDetails}</span>
        </div>
      </div>
    </div>
  );
});

const SeriesFileSummary = () => {
  const { seriesId } = useParams();

  const [groupBy, setGroupBy] = useState('GroupName,FileVersion,FileSource');
  const [getFileSummary, fileSummaryQuery] = useLazyGetSeriesFileSummeryQuery();
  const fileSummary = fileSummaryQuery.data;

  const summary = useMemo(() => {
    let TotalEpisodeSize = 0;
    const ByTypeMap: Record<string, { count: number; source: Record<string, number> }> = {};
    const GroupsMap: string[] = [];
    forEach(fileSummary?.Groups, (group) => {
      if (group.GroupNameShort && GroupsMap.indexOf(group.GroupNameShort) === -1) { GroupsMap.push(group.GroupNameShort); }
      forEach(group.RangeByType, (item, type) => {
        TotalEpisodeSize += item.FileSize;
        const mappedType = type === 'Normal' ? 'Episode' : type;
        const byType = ByTypeMap[mappedType] || (ByTypeMap[mappedType] = { count: 0, source: {} });
        byType.count += item.Count;
        if (group.FileSource) {
          byType.source[group.FileSource] = get(byType.source, group.FileSource, 0) + item.Count;
        }
      });
    });

    const SourceByType = map(ByTypeMap, ({ count, source }, type) => ({ type, count, source: map(source, (c, s) => `${s} (${c})`).join(', ') || 'N/A' }));
    const Groups = GroupsMap.join(', ');

    return {
      TotalEpisodeSize,
      SourceByType,
      Groups,
    };
  }, [fileSummary]);

  useEffect(() => {
    if (!seriesId) return;
    getFileSummary({ SeriesID: seriesId, groupBy }).catch(console.error);
  }, [seriesId, groupBy, getFileSummary]);

  if (!seriesId) return null;

  return (
    <div className="flex gap-x-8">
      <ShokoPanel title="Files Overview" className="w-[22.375rem] sticky top-0 shrink-0" transparent contentClassName="gap-y-8">
        <Select id="episodeType" label="Group By" value={groupBy} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setGroupBy(event.target.value)}>
          <option value="">Nothing</option>
          <option value="GroupName">+ Release Group</option>
          <option value="GroupName,FileVersion,FileSource">+ File Source</option>
          <option value="GroupName,FileVersion,FileSource,FileLocation">+ Location</option>
          <option value="GroupName,FileVersion,FileSource,FileLocation,VideoCodecs,VideoBitDepth,VideoResolutuion">+ Video</option>
          <option value="GroupName,FileVersion,FileSource,FileLocation,VideoCodecs,VideoBitDepth,VideoResolutuion,AudioCodecs,AudioLanguages,AudioStreamCount">+ Audio</option>
          <option value="GroupName,FileVersion,FileSource,FileLocation,VideoCodecs,VideoBitDepth,VideoResolutuion,AudioCodecs,AudioLanguages,AudioStreamCount,SubtitleCodecs,SubtitleLanguages,SubtitleStreamCount">+ Subtitles</option>
        </Select>
        {map(summary.SourceByType, ({ type, count, source }, index) => (
          <Fragment key={`${type}-${index}`}>
            <div className="flex flex-col gap-y-1">
              <span className="font-semibold">{type} Count</span>
              {count}
            </div>
            <div className="flex flex-col gap-y-1">
              <span className="font-semibold">{type} Source</span>
              {source}
            </div>
          </Fragment>
        ))}
        <div className="flex flex-col gap-y-1">
          <span className="font-semibold">Total File Size</span>
          {prettyBytes(summary.TotalEpisodeSize, { binary: true })}
        </div>
        <div className="flex flex-col gap-y-1">
          <span className="font-semibold">Groups</span>
          {summary.Groups || 'N/A'}
        </div>
      </ShokoPanel>

      <div className="flex grow flex-col gap-y-8">
        <div className="flex items-center justify-between rounded border border-panel-border bg-panel-background-transparent px-8 py-5 text-xl font-semibold">
          Files Breakdown
          <div><span className="text-panel-important">{fileSummary?.Groups.length || 0}</span> {fileSummary?.Groups.length === 1 ? 'Entry' : 'Entries'}</div>
        </div>
        {map(fileSummary?.Groups, (range, idx) => <SummaryGroup key={`group-${idx}`} group={range} />)}
        {get(fileSummary, 'MissingEpisodes.length', 0) > 0 && (
          <ShokoPanel title="Missing Files" transparent contentClassName="gap-y-4">
            {map(fileSummary?.MissingEpisodes, episode => (
              <div className="grid grid-cols-6 gap-x-12">
                <div>
                  {episode.Type}
                  &nbsp;
                  {episode.EpisodeNumber}
                </div>
                <div className="col-span-4">
                  {find(episode.Titles, ['Language', 'en'])?.Name || '--'}
                  &nbsp;(
                  <a
                    className="inline-flex items-center gap-x-1 text-panel-primary"
                    href={`https://anidb.net/episode/${episode.ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {episode.ID}
                    <Icon className="text-panel-primary" path={mdiOpenInNew} size={0.8333} />
                  </a>
                  )
                </div>
                <div>{episode.AirDate}</div>
              </div>
            ))}
          </ShokoPanel>
        )}
      </div>
    </div>
  );
};

export default SeriesFileSummary;
