import React, { useCallback, useMemo, useState } from 'react';
import { mdiChevronLeft, mdiChevronRight, mdiMagnify, mdiOpenInNew } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import { get, groupBy, map, toNumber } from 'lodash';
import prettyBytes from 'pretty-bytes';
import { useDebounce } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ShokoIcon from '@/components/ShokoIcon';
import TransitionDiv from '@/components/TransitionDiv';
import AVDumpFileIcon from '@/components/Utilities/Unrecognized/AvDumpFileIcon';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { useEpisodeAniDBQuery } from '@/core/react-query/episode/queries';
import { useFileQuery, useFilesInfiniteQuery } from '@/core/react-query/file/queries';
import { useSeriesAniDBQuery } from '@/core/react-query/series/queries';
import { FileSortCriteriaEnum } from '@/core/types/api/file';
import { useFlattenListResult } from '@/hooks/useFlattenListResult';
import { useRowSelection } from '@/hooks/useRowSelection';

import { staticColumns } from './UnrecognizedUtility';

import type { UtilityHeaderType } from './UnrecognizedUtility';
import type { FileType } from '@/core/types/api/file';

type FileSelectedProps = {
  fileId: number;
};

const FileSelected = (props: FileSelectedProps) => {
  const { fileId } = props;
  const { data: file } = useFileQuery(fileId, { include: ['XRefs', 'MediaInfo'] }, !!fileId);
  const fileAniDbUrl = `https://anidb.net/file/${file?.AniDB?.ID}`;
  const { data: seriesInfo } = useSeriesAniDBQuery(
    get(file, 'SeriesIDs.0.SeriesID.AniDB', 0),
    get(file, 'SeriesIDs.0.SeriesID.AniDB', 0) !== 0,
  );
  const { data: episodeInfo } = useEpisodeAniDBQuery(
    get(file, 'SeriesIDs.0.EpisodeIDs.0.ID', 0),
    get(file, 'SeriesIDs.0.EpisodeIDs.0.ID', 0) !== 0,
  );

  const videoInfo = useMemo(() => {
    const info: string[] = [];
    const VideoSource = get(file, 'AniDB.Source');
    if (VideoSource) {
      info.push(VideoSource);
    }

    const VideoBitDepth = get(file, 'MediaInfo.Video.0.BitDepth');
    if (VideoBitDepth) {
      info.push(`${VideoBitDepth}-bit`);
    }

    const VideoBitRate = get(file, 'MediaInfo.Video.0.BitRate');
    if (VideoBitRate) {
      info.push(`${Math.round(toNumber(VideoBitRate) / 1024)} kb/s`);
    }

    const VideoResolution = get(file, 'MediaInfo.Video.0.Resolution');
    if (VideoResolution) {
      info.push(VideoResolution);
    }

    const VideoWidth = get(file, 'MediaInfo.Video.0.Width');
    const VideoHeight = get(file, 'MediaInfo.Video.0.Height');
    if (VideoWidth && VideoHeight) {
      info.push(`${VideoWidth}x${VideoHeight}`);
    }

    return info;
  }, [file]);

  const audioInfo = useMemo(() => {
    const info: string[] = [];
    const AudioFormat = get(file, 'MediaInfo.Audio.0.Format.Name');
    const AudioLanguages = map(file?.MediaInfo?.Audio, item => item.LanguageCode);
    if (AudioFormat) {
      info.push(AudioFormat);
    }
    if (AudioLanguages && AudioLanguages.length > 0) {
      info.push(`${AudioLanguages.length > 1 ? 'Multi Audio' : 'Audio'} (${AudioLanguages.join(',')})`);
    }
    const SubtitleLanguages = map(file?.MediaInfo?.Subtitles, item => item.LanguageCode);
    if (SubtitleLanguages && SubtitleLanguages.length > 0) {
      info.push(`${SubtitleLanguages.length > 1 ? 'Multi Subs' : 'Subs'} (${SubtitleLanguages.join(',')})`);
    }

    return info;
  }, [file]);

  return (
    <TransitionDiv className="flex flex-col gap-y-4">
      <div className="mb-4 flex flex-col gap-y-2">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">File Name</span>
          <a href={fileAniDbUrl} target="_blank" rel="noopener noreferrer">
            <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
              <div className="metadata-link-icon AniDB" />
              AniDB File
              <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
            </div>
          </a>
        </div>
        {file?.Locations[0].RelativePath.split(/[/\\]/g).pop()}
      </div>
      <div className="mb-4 flex flex-col gap-y-2">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Series Name</span>
          <a href={fileAniDbUrl} target="_blank" rel="noopener noreferrer">
            <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
              <ShokoIcon className="w-6" />
              Shoko
              <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
            </div>
          </a>
        </div>
        {seriesInfo?.Titles.find(x => x.Type === 'Main')?.Name ?? 'Unknown'}
      </div>
      <div className="mb-4 flex flex-col gap-y-2">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Episode Name</span>
        </div>
        {episodeInfo?.Title ?? 'Unknown'}
      </div>
      <div className="mb-4 flex flex-col gap-y-2">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Location</span>
        </div>
        {get(file, 'Locations.0.RelativePath', 'Unknown')}
      </div>
      <div className="mb-4 flex flex-col gap-y-2">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Video</span>
        </div>
        {videoInfo.join(' | ')}
      </div>
      <div className="mb-4 flex flex-col gap-y-2">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Audio</span>
        </div>
        {audioInfo.join(' | ')}
      </div>
      <div className="mb-4 flex flex-col gap-y-2">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Hash</span>
        </div>
        {get(file, 'Hashes.ED2K', '')}
      </div>
      <div className="mb-4 flex flex-col gap-y-2">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">CRC</span>
        </div>
        {get(file, 'Hashes.CRC32', '')}
      </div>
      <div className="mb-4 flex flex-col gap-y-2">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">SHA1</span>
        </div>
        {get(file, 'Hashes.SHA1', '')}
      </div>
    </TransitionDiv>
  );
};

const FileSearch = () => {
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounce(search, 250);
  const { data: fileResults, fetchNextPage, isFetchingNextPage } = useFilesInfiniteQuery({
    include: ['XRefs'],
    sortOrder: [-FileSortCriteriaEnum.ImportedAt],
    pageSize: 50,
  }, debounceSearch);
  const [files, fileCount] = useFlattenListResult<FileType>(fileResults);

  const {
    handleRowSelect,
    rowSelection,
    selectedRows,
    setRowSelection,
  } = useRowSelection<FileType>(files);

  const [viewIndex, setViewIndex] = useState(0);

  const onNextView = useCallback(() => {
    setViewIndex((prev) => {
      if (prev + 1 >= selectedRows.length) return 0;

      return prev + 1;
    });
  }, [selectedRows]);

  const onPrevView = useCallback(() => {
    setViewIndex((prev) => {
      if (prev - 1 < 0) return selectedRows.length - 1;

      return prev - 1;
    });
  }, [selectedRows]);

  const selectedId = useMemo(() => selectedRows[viewIndex]?.ID, [selectedRows, viewIndex]);

  const columns = useMemo<UtilityHeaderType<FileType>[]>(
    () => [
      ...staticColumns,
      {
        id: 'status',
        name: 'Status',
        className: 'w-16',
        item: file => <AVDumpFileIcon file={file} />,
      },
    ],
    [],
  );

  const renderTotalFiles = () => (
    <div className="flex font-semibold">
      <p className="text-panel-text-important">{fileCount ?? 0}</p>
      &nbsp;
      {fileCount <= 1 ? 'File' : 'Files'}
    </div>
  );

  const renderMetadata = useMemo(() => {
    const selectedSeriesCount = Object.keys(
      groupBy(selectedRows.flatMap(x => x.SeriesIDs).map(x => x?.SeriesID), x => x?.ID),
    ).length;
    const selectedSize = prettyBytes(selectedRows.reduce((prev, cur) => prev + cur.Size, 0), { binary: true });
    const selectedEpisodeCount = selectedRows.flatMap(x => x.SeriesIDs).map(x => x?.EpisodeIDs).length;

    return (
      <>
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Series Count</span>
          <span>{selectedSeriesCount}</span>
        </div>
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Episode Count</span>
          <span>{selectedEpisodeCount}</span>
        </div>
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Total Size</span>
          <span>{selectedSize}</span>
        </div>
      </>
    );
  }, [selectedRows]);

  return (
    <div className="flex grow flex-col gap-y-8">
      <ShokoPanel title="File Search" options={renderTotalFiles()}>
        <div className="flex items-center">
          <Input
            type="text"
            placeholder="Search..."
            startIcon={mdiMagnify}
            id="search"
            onChange={({ target: { value } }) => {
              setSearch(_ => value);
            }}
            value={search}
          />
        </div>
      </ShokoPanel>
      <div className="flex grow justify-between overflow-y-auto">
        <div className="flex w-full rounded-md border border-panel-border bg-panel-background p-8 md:max-w-[65%] lg:max-w-[75%]">
          {(fileCount ?? 0) > 0
            ? (
              <UtilitiesTable
                count={fileCount}
                fetchNextPage={fetchNextPage}
                handleRowSelect={handleRowSelect}
                columns={columns}
                isFetchingNextPage={isFetchingNextPage}
                rows={files}
                rowSelection={rowSelection}
                setSelectedRows={setRowSelection}
                skipSort={!!debounceSearch}
              />
            )
            : <div className="flex grow items-center justify-center font-semibold">No series without files!</div>}
        </div>
        <div className=" ml-8 flex max-h-[45rem] w-full flex-col lg:max-w-[25%]">
          {selectedRows?.length > 0 && (
            <div className="flex w-full flex-col rounded-md border border-panel-border bg-panel-background p-8">
              <div className="mb-8 flex w-full text-xl font-semibold">Selected Summary</div>
              {renderMetadata}
              <div className="my-8 flex w-full text-xl font-semibold">
                <div className="flex w-full justify-between">
                  <span className="grow">Selected File</span>
                  <div className={cx('flex', selectedRows.length <= 1 ? 'hidden' : '')}>
                    <Button buttonType="secondary" onClick={() => onPrevView()}>
                      <Icon className="text-panel-icon-action" path={mdiChevronLeft} size={1} />
                    </Button>
                    <Button buttonType="secondary" onClick={() => onNextView()}>
                      <Icon className="text-panel-icon-action" path={mdiChevronRight} size={1} />
                    </Button>
                  </div>
                </div>
              </div>
              <FileSelected
                fileId={selectedId ?? 0}
              />
            </div>
          )}
          {!selectedRows?.length && (
            <div className="flex h-full w-full flex-col rounded-md border border-panel-border bg-panel-background p-8">
              <div className="flex grow items-center justify-center font-semibold">Select File To Populate</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default FileSearch;
