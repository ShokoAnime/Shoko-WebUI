import React from 'react';
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
  
  return (
    <div className="flex flex-col space-y-8">
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
  );
};

export default SeriesFileSummary;