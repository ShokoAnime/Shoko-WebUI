import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { mdiLoading, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { find, forEach, get, map, omit, toNumber } from 'lodash';
import prettyBytes from 'pretty-bytes';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useSeriesFileSummaryQuery } from '@/core/react-query/webui/queries';
import { dayjs } from '@/core/util';
import useEventCallback from '@/hooks/useEventCallback';

import type {
  WebuiSeriesFileSummaryGroupRangeByType,
  WebuiSeriesFileSummaryGroupType,
  WebuiSeriesFileSummaryMissingEpisodeType,
  WebuiSeriesFileSummaryType,
} from '@/core/types/api/webui';

type ModeType = 'Series' | 'Missing';

const HeaderFragment = ({ range, title }) => {
  if (!title || !range) return null;
  return (
    <>
      <span>{title}</span>
      <span className="text-panel-text-important">{range}</span>
    </>
  );
};

type HeaderProps = { ranges: WebuiSeriesFileSummaryGroupRangeByType };
const Header = ({ ranges }: HeaderProps) => (
  <div className="flex gap-x-2">
    <HeaderFragment title={ranges?.Normal?.Range.length > 2 ? 'Episodes' : 'Episode'} range={ranges?.Normal?.Range} />
    <HeaderFragment title={ranges?.Normal?.Range.length > 2 ? 'Specials' : 'Special'} range={ranges?.Special?.Range} />
    {map(omit(ranges, ['Normal', 'Special']), (item, key) => <HeaderFragment title={key} range={item.Range} />)}
  </div>
);

const SummaryGroup = React.memo(({ group }: { group: WebuiSeriesFileSummaryGroupType }) => {
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
    <div className="flex flex-col gap-y-6 rounded border border-panel-border bg-panel-background-transparent p-6">
      <div className="flex text-xl font-semibold">
        <Header ranges={group.RangeByType} />
      </div>
      <div className="flex">
        <div className="flex grow flex-col gap-y-4 font-semibold">
          <span>Group</span>
          <span>Video</span>
          <span>Location</span>
        </div>
        <div className="flex grow-[2] flex-col gap-y-4">
          <span>{groupDetails}</span>
          <span>{videoDetails}</span>
          <span>{locationDetails}</span>
        </div>
        <div className="flex grow flex-col gap-y-4 font-semibold">
          <span>Total</span>
          <span>Audio</span>
          <span>Subtitles</span>
        </div>
        <div className="flex grow-[2] flex-col gap-y-4">
          <span>{sizes}</span>
          <span>{audioDetails}</span>
          <span>{subtitleDetails}</span>
        </div>
      </div>
    </div>
  );
});

type FileSelectionHeaderProps = {
  mode: ModeType;
  setMode: (mode: ModeType) => void;
  fileSummary?: WebuiSeriesFileSummaryType;
};
const FilesSelectionHeader = React.memo(({ fileSummary, mode, setMode }: FileSelectionHeaderProps) => (
  <div className="flex h-[6.125rem] items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent px-6 py-4">
    <div className="flex gap-x-2 text-xl font-semibold">
      {mode}
      &nbsp;Files |
      {mode === 'Series' && (
        <>
          <span className="text-panel-text-important">{fileSummary?.Groups.length ?? 0}</span>
          {fileSummary?.Groups?.length === 1 ? 'Entry' : 'Entries'}
        </>
      )}
      {mode === 'Missing' && (
        <>
          <span className="text-panel-text-important">{fileSummary?.MissingEpisodes.length ?? 0}</span>
          {fileSummary?.MissingEpisodes?.length === 1 ? 'Entry' : 'Entries'}
        </>
      )}
    </div>
    <div className="flex items-center gap-x-1 text-xl font-semibold">
      {['Series', 'Missing'].map((key: ModeType) => (
        <Button
          className={cx(
            'w-[150px] rounded-lg ml-2 py-3 px-4 !font-normal',
            mode !== key
              ? 'bg-panel-toggle-background-alt text-panel-toggle-text-alt hover:bg-panel-toggle-background-hover'
              : '!bg-panel-toggle-background text-panel-toggle-text',
          )}
          key={key}
          onClick={() => setMode(key)}
        >
          {key}
          &nbsp;Files
        </Button>
      ))}
    </div>
  </div>
));

type FileOverviewProps = {
  TotalEpisodeSize: number;
  SourceByType: {
    type: string;
    count: number;
    source: string;
  }[];
  Groups: string;
};
const FileOverview = React.memo(({ summary }: { summary: FileOverviewProps }) => (
  <ShokoPanel
    title="Files Overview"
    className="w-400 shrink-0 grow"
    contentClassName="gap-y-6"
    transparent
    sticky
    fullHeight={false}
  >
    {map(summary.SourceByType, ({ count, source, type }, index) => (
      <React.Fragment key={`${type}-${index}`}>
        <div className="flex flex-col gap-y-1">
          <span className="font-semibold">
            {type}
            &nbsp;Count
          </span>
          <span className="font-normal">{count}</span>
        </div>
        <div className="flex flex-col gap-y-1">
          <span className="font-semibold">
            {type}
            &nbsp;Source
          </span>
          <span className="font-normal">{source}</span>
        </div>
      </React.Fragment>
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
));

const groupFilterMap = {
  GroupName: 'Release Group',
  FileVersion: 'Video Version',
  FileLocation: 'Location',
  AudioLanguages: 'Audio Language',
  SubtitleLanguages: 'Subtitle Language',
  VideoResolution: 'Resolution',
};
type GroupFilterPanelProps = {
  filter: string[];
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
const GroupFilterPanel = React.memo(({ filter, onFilterChange }: GroupFilterPanelProps) => (
  <ShokoPanel
    title="Grouping Options"
    contentClassName="flex flex-col gap-y-2 rounded-lg bg-panel-input p-6"
    transparent
    fullHeight={false}
  >
    {Object.keys(groupFilterMap).map((k: keyof typeof groupFilterMap) => (
      <Checkbox
        justify
        label={groupFilterMap[k]}
        id={k}
        key={k}
        isChecked={filter.includes(k)}
        onChange={onFilterChange}
      />
    ))}
  </ShokoPanel>
));

const MissingEpisodeRow = React.memo((
  { episode, rowId }: { episode: WebuiSeriesFileSummaryMissingEpisodeType, rowId: number },
) => (
  <div
    className={cx(
      'flex p-4 gap-16 rounded-lg border text-left transition-colors border-panel-border items-center',
      rowId % 2 === 0 ? 'bg-panel-background' : 'bg-panel-background-alt',
    )}
  >
    <div className="w-[12.5rem]">
      {episode.Type}
      &nbsp;
      {episode.EpisodeNumber.toString().padStart(2, '0')}
    </div>
    <div className="flex w-[46.875rem] flex-row">
      {find(episode.Titles, ['Language', 'en'])?.Name ?? '--'}
      &nbsp;
      <a
        className="inline-flex items-center gap-0 text-panel-text-primary"
        href={`https://anidb.net/episode/${episode.ID}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="text-panel-text">(</span>
        {episode.ID}
        <span className="text-panel-text">)</span>
        &nbsp;
        <Icon className="text-panel-text-primary" path={mdiOpenInNew} size={1} />
      </a>
    </div>
    <div>
      {dayjs(episode.AirDate).format('MMMM DD YYYY')}
    </div>
  </div>
));

const MissingEpisodes = React.memo(({ missingEps }: { missingEps?: WebuiSeriesFileSummaryMissingEpisodeType[] }) => (
  missingEps?.length === 0 || typeof missingEps === 'undefined'
    ? (
      <div className="flex h-full flex-col justify-center rounded-lg border border-panel-border bg-panel-background-transparent p-6 text-center font-semibold transition-colors">
        <div>You have no missing episodes or specials. Well done!</div>
      </div>
    )
    : (
      <div className="flex max-h-[72vh] flex-col rounded-lg border border-panel-border bg-panel-background-transparent p-6 transition-colors">
        <div className="sticky top-0 z-[1] flex bg-panel-background-alt">
          <div className="mb-1 flex grow items-center gap-16 rounded-lg border border-panel-border bg-panel-table-header p-4 text-left font-semibold transition-colors">
            <div className="w-[12.5rem] text-left">
              Type
            </div>
            <div className="w-[46.875rem] text-left">
              Title
            </div>
            <div className="w-[139px] text-left">
              Airing Date
            </div>
          </div>
        </div>
        <div className="flex w-full grow-0 flex-col gap-y-1 overflow-auto overscroll-contain">
          {missingEps?.map((episode, rowId) => <MissingEpisodeRow episode={episode} key={episode.ID} rowId={rowId} />)}
        </div>
      </div>
    )
));

const SeriesFileSummary = () => {
  const { seriesId } = useParams();

  const [mode, setMode] = useState<ModeType>('Series');
  const [filter, setFilter] = useState<string[]>([...Object.keys(groupFilterMap), 'VideoBitDepth']);

  useEffect(() => setFilter([...Object.keys(groupFilterMap), 'VideoBitDepth']), [mode]);

  const handleFilterChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked: active, id: option } = event.target;
    const optionArr = [option];
    if (option === 'VideoResolution') optionArr.push('VideoBitDepth');
    if (active && !filter.includes(option)) setFilter([...filter, ...optionArr]);
    if (!active && filter.includes(option)) {
      setFilter(
        filter.filter(
          k => ((option === 'VideoResolution') ? !(k === 'VideoResolution' || k === 'VideoBitDepth') : (k !== option)),
        ),
      );
    }
  });

  const { data: fileSummary, isLoading } = useSeriesFileSummaryQuery(
    toNumber(seriesId!),
    { groupBy: filter.join(',') },
    !!seriesId,
  );

  const summary = useMemo(() => {
    let TotalEpisodeSize = 0;
    const ByTypeMap: Record<string, { count: number, source: Record<string, number> }> = {};
    const GroupsMap: string[] = [];
    forEach(fileSummary?.Groups, (group) => {
      if (group.GroupNameShort && GroupsMap.indexOf(group.GroupNameShort) === -1) GroupsMap.push(group.GroupNameShort);
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

    const SourceByType = map(
      ByTypeMap,
      ({ count, source }, type) => ({ type, count, source: map(source, (c, s) => `${s} (${c})`).join(', ') || 'N/A' }),
    );
    const Groups = GroupsMap.join(', ');

    return {
      TotalEpisodeSize,
      SourceByType,
      Groups,
    };
  }, [fileSummary]);

  if (!seriesId) return null;

  return (
    <div className="flex w-full gap-x-6">
      <div className="flex flex-col gap-y-6">
        {mode === 'Series' && <GroupFilterPanel filter={filter} onFilterChange={handleFilterChange} />}
        <FileOverview summary={summary} />
      </div>

      <div className="flex w-full flex-col gap-y-6">
        <FilesSelectionHeader
          mode={mode}
          setMode={setMode}
          fileSummary={fileSummary}
        />

        <div className="flex grow flex-col gap-y-6">
          {isLoading && (
            <div className="flex grow items-center justify-center text-panel-text-primary">
              <Icon path={mdiLoading} spin size={3} />
            </div>
          )}
          {mode === 'Series'
            && map(fileSummary?.Groups, (range, idx) => <SummaryGroup key={`group-${idx}`} group={range} />)}
          {mode === 'Missing' && <MissingEpisodes missingEps={fileSummary?.MissingEpisodes} />}
        </div>
      </div>
    </div>
  );
};

export default SeriesFileSummary;
