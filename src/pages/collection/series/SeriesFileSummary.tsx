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
      <span className="text-highlight-2">{range}</span>
    </React.Fragment>  
  );
};

const Header = ({ ranges }) => (
  <div className="flex space-x-2">
    <HeaderFragment title="Episodes" range={ranges?.Normal?.Range} />
    <HeaderFragment title="Specials" range={ranges?.Specials?.Range} />
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
    if (key === 'Normal') { idx = 'Episodes'; } else if (key === 'Specials') { idx = 'Specials'; } else { idx = 'Other'; }
    if (!sizes[idx]) { sizes[idx] = { size: 0, count: 0 }; }
    sizes[idx].size += item.FileSize;
    sizes[idx].count += item.Count;
  });
  
  return map(sizes, (size, name) => (
    `${size.count} ${name} (${prettyBytes(size.size, { binary: true })})`
  )).join(' | ');
};

const SeriesFileSummary = () => {
  const { seriesId } = useParams();
  if (!seriesId) {
    return null;
  }

  const fileSummaryData = useGetSeriesFileSummeryQuery({ SeriesID: seriesId });
  const fileSummary = fileSummaryData.data;
  
  const summary = useMemo(() => {
    let TotalEpisodeCount = 0;
    let TotalEpisodeSize = 0;
    let TotalEpisodeSourceMap = {};
    let SpecialEpisodeCount = 0;
    let SpecialEpisodeSourceMap = {};
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
  
  
  
  return (
    <div className="flex space-x-8">
      <div className="grow-0 shrink-0 w-[22.375rem] flex flex-col align-top space-y-8">
        <div>
          <ShokoPanel title="Files Overview" transparent>
            <div className="space-y-8">
              <div className="flex flex-col">
                <span className="font-semibold">Episode Count</span>
                <span>{summary.TotalEpisodeCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Episode Source</span>
                <span>{summary.TotalEpisodeSource}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Special Count</span>
                <span>{summary.SpecialEpisodeCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Special Source</span>
                <span>{summary.SpecialEpisodeSource}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Total File Size</span>
                <span>{prettyBytes(summary.TotalEpisodeSize, { binary: true })}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Groups</span>
                <span>{summary.Groups}</span>
              </div>
            </div>
          </ShokoPanel>
        </div>
      </div>
      <div className="flex flex-col space-y-8 grow">
        <div className="rounded bg-background-alt/25 px-8 py-4 flex justify-between items-center border-background-border border font-semibold text-xl">
          Files Breakdown
          <div><span className="text-highlight-2">{fileSummary?.Groups.length || 0}</span> Source Entries</div>
        </div>
        {map(fileSummary?.Groups, (range, idx) => (
          <ShokoPanel key={`range-${idx}`} className="grow" title={<Header ranges={range.RangeByType}/>}>
            <div className="flex">
              <div className="grow flex flex-col space-y-4">
                <span className="font-semibold">Group</span>
                <span className="font-semibold">Video</span>
                <span className="font-semibold">Location</span>
              </div>
              <div className="grow-[2] flex flex-col space-y-4">
                <span>{range.GroupName} | v{range.Version}</span>
                <span>{range.Source} | {range.BitDepth}-bit | {range.Resolution} | {range.Width}x{range.Height} | {range.VideoCodecs} </span>
                <span>{range.Location}</span>
              </div>
              <div className="grow flex flex-col space-y-4">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">Audio</span>
                <span className="font-semibold">Subs</span>
              </div>
              <div className="grow-[2] flex flex-col space-y-4">
                <span>{renderSizes(range.RangeByType)}</span>
                <span>{range.AudioCodecs} | {range.AudioCount > 1 ? `Multi Audio (${range.AudioLanguages.join(', ')})` : range.AudioLanguages.toString()}</span>
                <span>{range.SubtitleCodecs} | {range.SubtitleCount > 1 ? `Multi Subs (${range.SubtitleLanguages.join(', ')})` : range.SubtitleLanguages.toString()}</span>
              </div>
            </div>
          </ShokoPanel>
        ))}
        {get(fileSummary, 'MissingEpisodes.length', 0) > 0 && <ShokoPanel title="Missing Files">
          {map(fileSummary?.MissingEpisodes, episode => (
            <div className="grid grid-cols-3 mb-4">
              <div className="mr-12">{episode.Type} {episode.EpisodeNumber}</div>
              <div className="flex mr-12">{find(episode.Titles, ['Language', 'en'])?.Name || '--'} (<a className="text-highlight-1" href={`https://anidb.net/episode/${episode.ID}`} target="_blank" rel="noopener noreferrer">{episode.ID}</a>)<Icon className="text-highlight-1" path={mdiOpenInNew} size={1} /></div>
              <div>{episode.AirDate}</div>
            </div>
          ))}
        </ShokoPanel>}
      </div>
    </div>
  );
};

export default SeriesFileSummary;