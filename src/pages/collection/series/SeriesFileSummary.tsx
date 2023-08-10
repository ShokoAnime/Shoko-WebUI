import React, { useMemo } from 'react';
import { useParams } from 'react-router';
import { mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { find, forEach, get, map, omit } from 'lodash';
import prettyBytes from 'pretty-bytes';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useGetSeriesFileSummeryQuery } from '@/core/rtkQuery/splitV3Api/webuiApi';

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

type SizeTotals = {
  [key: string]: {
    size: number;
    count: number;
  };
};

const renderSizes = (ranges) => {
  const sizes: SizeTotals = {};
  forEach(ranges, (item, key) => {
    let idx;
    if (key === 'Normal') {
      idx = item.Count > 1 ? 'Episodes' : 'Episode';
    } else if (key === 'Special') {
      idx = item.Count > 1 ? 'Specials' : 'Special';
    } else {
      idx = 'Other';
    }
    if (!sizes[idx]) {
      sizes[idx] = { size: 0, count: 0 };
    }
    sizes[idx].size += item.FileSize;
    sizes[idx].count += item.Count;
  });

  return map(sizes, (size, name) => (
    `${size.count} ${name} (${prettyBytes(size.size, { binary: true })})`
  )).join(' | ');
};

const SeriesFileSummary = () => {
  const { seriesId } = useParams();

  const fileSummaryData = useGetSeriesFileSummeryQuery({ SeriesID: seriesId! }, { skip: !seriesId });
  const fileSummary = fileSummaryData.data;

  const summary = useMemo(() => {
    let TotalEpisodeCount = 0;
    let TotalEpisodeSize = 0;
    const TotalEpisodeSourceMap = {};
    let SpecialEpisodeCount = 0;
    const SpecialEpisodeSourceMap = {};
    const GroupsMap: string[] = [];
    forEach(fileSummary?.Groups, (group) => {
      if (GroupsMap.indexOf(group.GroupName) === -1) GroupsMap.push(group.GroupName);
      forEach(group.RangeByType, (item, type) => {
        TotalEpisodeCount += item.Count;
        TotalEpisodeSize += item.FileSize;
        TotalEpisodeSourceMap[group.Source] = get(TotalEpisodeSourceMap, group.Source, 0) + item.Count;
        if (type === 'Special') {
          SpecialEpisodeCount += item.Count;
          SpecialEpisodeSourceMap[group.Source] = get(SpecialEpisodeSourceMap, group.Source, 0) + item.Count;
        }
      });
    });

    const TotalEpisodeSource = map(TotalEpisodeSourceMap, (count, type) => `${type} (${count})`).join(', ');
    const SpecialEpisodeSource = map(SpecialEpisodeSourceMap, (count, type) => `${type} (${count})`).join(', ');
    const Groups = GroupsMap.join(', ');

    return {
      TotalEpisodeCount,
      TotalEpisodeSize,
      TotalEpisodeSource,
      SpecialEpisodeCount,
      SpecialEpisodeSource,
      Groups,
    };
  }, [fileSummary]);

  if (!seriesId) return null;

  return (
    <div className="flex gap-x-8">
      <ShokoPanel
        title="Files Overview"
        className="sticky top-0 w-[22.375rem] shrink-0"
        transparent
        contentClassName="gap-y-8"
      >
        <div className="flex flex-col gap-y-1">
          <span className="font-semibold">Episode Count</span>
          {summary.TotalEpisodeCount}
        </div>
        <div className="flex flex-col gap-y-1">
          <span className="font-semibold">Episode Source</span>
          {summary.TotalEpisodeSource}
        </div>
        <div className="flex flex-col gap-y-1">
          <span className="font-semibold">Special Count</span>
          {summary.SpecialEpisodeCount}
        </div>
        <div className="flex flex-col gap-y-1">
          <span className="font-semibold">Special Source</span>
          {summary.SpecialEpisodeSource || 'N/A'}
        </div>
        <div className="flex flex-col gap-y-1">
          <span className="font-semibold">Total File Size</span>
          {prettyBytes(summary.TotalEpisodeSize, { binary: true })}
        </div>
        <div className="flex flex-col gap-y-1">
          <span className="font-semibold">Groups</span>
          {summary.Groups}
        </div>
      </ShokoPanel>

      <div className="flex grow flex-col gap-y-8">
        <div className="flex items-center justify-between rounded border border-panel-border bg-panel-background-transparent px-8 py-5 text-xl font-semibold">
          Files Breakdown
          <div>
            <span className="text-panel-important">{fileSummary?.Groups.length || 0}</span>
            &nbsp;Source&nbsp;
            {fileSummary?.Groups.length === 1 ? 'Entry' : 'Entries'}
          </div>
        </div>
        {map(
          fileSummary?.Groups,
          (range, idx) => (
            <div key={`range-${idx}`} className="flex flex-col gap-y-8 rounded border border-panel-border p-8">
              <div className="flex text-xl font-semibold">
                <Header ranges={range.RangeByType} />
              </div>
              <div className="flex">
                <div className="flex grow flex-col gap-y-4 font-semibold">
                  <span>Group</span>
                  <span>Video</span>
                  <span>Location</span>
                </div>
                <div className="flex grow-[2] flex-col gap-y-4">
                  <span>
                    {range.GroupName}
                    &nbsp;| v
                    {range.Version}
                  </span>
                  <span>
                    {range.Source}
                    &nbsp;|&nbsp;
                    {range.BitDepth}
                    -bit |&nbsp;
                    {range.Resolution}
                    &nbsp;|&nbsp;
                    {range.Width}
                    x
                    {range.Height}
                    &nbsp;|&nbsp;
                    {range.VideoCodecs}
                  </span>
                  <span>{range.Location}</span>
                </div>
                <div className="flex grow flex-col gap-y-4 font-semibold">
                  <span>Total</span>
                  <span>Audio</span>
                  <span>{range.SubtitleCount > 1 ? 'Subtitles' : 'Subtitle'}</span>
                </div>
                <div className="flex grow-[2] flex-col gap-y-4">
                  <span>{renderSizes(range.RangeByType)}</span>
                  <span className="uppercase">
                    {range.AudioCodecs}
                    &nbsp;|
                    {range.AudioCount > 1
                      ? `Multi Audio (${range.AudioLanguages.join(', ')})`
                      : range.AudioLanguages.toString()}
                  </span>
                  {range.SubtitleCount > 0
                    ? (
                      <span className="uppercase">
                        {range.SubtitleCodecs}
                        &nbsp;|
                        {range.SubtitleCount > 1
                          ? `Multi Subs (${range.SubtitleLanguages.join(', ')})`
                          : range.SubtitleLanguages.toString()}
                      </span>
                    )
                    : '-'}
                </div>
              </div>
            </div>
          ),
        )}
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
