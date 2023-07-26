import React, { useMemo } from 'react';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useParams } from 'react-router';
import { useGetSeriesFileSummeryQuery } from '@/core/rtkQuery/splitV3Api/webuiApi';
import { find, forEach, get, map, omit } from 'lodash';
import prettyBytes from 'pretty-bytes';
import { Icon } from '@mdi/react';
import { mdiOpenInNew } from '@mdi/js';

const HeaderFragment = ({ title, range }) => {
  if (!title || !range) { return null; }
  return (
    <React.Fragment>
      <span>{title}</span>
      <span className="text-panel-important">{range}</span>
    </React.Fragment>
  );
};

const Header = ({ ranges }) => (
  <div className="flex gap-x-2">
    <HeaderFragment title={ranges?.Normal?.Range.length > 2 ? 'Episodes' : 'Episode'} range={ranges?.Normal?.Range} />
    <HeaderFragment title={ranges?.Normal?.Range.length > 2 ? 'Specials' : 'Special'} range={ranges?.Special?.Range} />
    {map(omit(ranges, ['Normal', 'Special']), (item, key) => (
      <HeaderFragment title={key} range={item.Range} />
    ))}
  </div>
);

type SizeTotals = {
  [key: string] : {
    size: number;
    count: number;
  }
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
      if (GroupsMap.indexOf(group.GroupName) === -1) { GroupsMap.push(group.GroupName); }
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
      <ShokoPanel title="Files Overview" className="w-[22.375rem] sticky top-0 shrink-0" transparent contentClassName="gap-y-8">
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

      <div className="flex flex-col gap-y-8 grow">
        <div className="rounded-md bg-panel-background-transparent px-8 py-4 flex justify-between items-center border-panel-border border font-semibold text-xl">
          Files Breakdown
          <div><span className="text-panel-important">{fileSummary?.Groups.length || 0}</span> Source {fileSummary?.Groups.length === 1 ? 'Entry' : 'Entries'}</div>
        </div>
        {map(fileSummary?.Groups, (range, idx) => (
          <ShokoPanel key={`range-${idx}`} className="grow" title={<Header ranges={range.RangeByType} />} transparent>
            <div className="flex max-h-10">
              <div className="grow flex flex-col gap-y-4 font-semibold">
                <span>Group</span>
                <span>Video</span>
                <span>Location</span>
              </div>
              <div className="grow-[2] flex flex-col gap-y-4">
                <span>{range.GroupName} | v{range.Version}</span>
                <span>{range.Source} | {range.BitDepth}-bit | {range.Resolution} | {range.Width}x{range.Height} | {range.VideoCodecs} </span>
                <span>{range.Location}</span>
              </div>
              <div className="grow flex flex-col gap-y-4 font-semibold">
                <span>Total</span>
                <span>Audio</span>
                <span>{range.SubtitleCount > 1 ? 'Subtitles' : 'Subtitle'}</span>
              </div>
              <div className="grow-[2] flex flex-col gap-y-4">
                <span>{renderSizes(range.RangeByType)}</span>
                <span className="uppercase">{range.AudioCodecs} | {range.AudioCount > 1 ? `Multi Audio (${range.AudioLanguages.join(', ')})` : range.AudioLanguages.toString()}</span>
                <span className="uppercase">{range.SubtitleCodecs} | {range.SubtitleCount > 1 ? `Multi Subs (${range.SubtitleLanguages.join(', ')})` : range.SubtitleLanguages.toString()}</span>
              </div>
            </div>
          </ShokoPanel>
        ))}
        {get(fileSummary, 'MissingEpisodes.length', 0) > 0 && (
        <ShokoPanel disableOverflow title="Missing Files" transparent>
          {map(fileSummary?.MissingEpisodes, episode => (
            <div className="grid grid-cols-3 mb-4">
              <div className="mr-12">{episode.Type} {episode.EpisodeNumber}</div>
              <div className="flex mr-12">{find(episode.Titles, ['Language', 'en'])?.Name || '--'} (<a className="text-panel-primary" href={`https://anidb.net/episode/${episode.ID}`} target="_blank" rel="noopener noreferrer">{episode.ID}</a>)<Icon className="text-panel-primary" path={mdiOpenInNew} size={1} /></div>
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
