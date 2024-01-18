import React, { useState } from 'react';
import AnimateHeight from 'react-animate-height';
import {
  mdiChevronDown,
  mdiFileDocumentMultipleOutline,
  mdiFileDocumentOutline,
  mdiLoading,
  mdiOpenInNew,
  mdiRefresh,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import { useToggle } from 'usehooks-ts';

import EpisodeFileInfo from '@/components/Collection/Series/EpisodeFileInfo';
import Button from '@/components/Input/Button';
import Select from '@/components/Input/Select';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ItemCount from '@/components/Utilities/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import queryClient, { invalidateQueries } from '@/core/react-query/queryClient';
import { prefetchSeriesEpisodesWithMultipleReleasesQuery } from '@/core/react-query/release-management/prefetch';
import { useSeriesWithMultipleReleases } from '@/core/react-query/release-management/queries';
import { dayjs } from '@/core/util';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { ListResultType } from '@/core/types/api';
import type { EpisodeType } from '@/core/types/api/episode';
import type { FileType } from '@/core/types/api/file';
import type { SeriesWithMultipleReleasesType } from '@/core/types/api/series';
import type { UtilityHeaderType } from '@/pages/utilities/UnrecognizedUtility';

const colmuns: UtilityHeaderType<SeriesWithMultipleReleasesType>[] = [
  {
    id: 'series',
    name: 'Series',
    className: 'overflow-hidden line-clamp-1 grow basis-0',
    item: series => series.Name,
  },
  {
    id: 'entries',
    name: 'Entries',
    className: 'w-32',
    item: series => (
      <div>
        <span className="font-semibold text-panel-text-important">{series.EpisodeCount}</span>
        &nbsp;Entries
      </div>
    ),
  },
  {
    id: 'created',
    name: 'Date Updated',
    className: 'w-64',
    item: series => dayjs(series.Updated).format('MMMM DD YYYY, HH:mm'),
  },
];

const FileItem = ({ file }: { file: FileType }) => {
  const [option, setOption] = useState('keep');

  return (
    <div
      className="mt-6 flex cursor-default flex-col gap-y-6"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex gap-x-3">
        <div className="flex grow rounded-md border border-panel-border bg-panel-background px-4 py-3">
          <MenuButton onClick={() => {}} icon={mdiFileDocumentOutline} name="Force Update File Info" />
          {file.AniDB && (
            <a
              href={`https://anidb.net/file/${file.AniDB.ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3"
            >
              <div className="flex items-center gap-x-2 font-semibold text-panel-text-primary">
                <div className="metadata-link-icon AniDB" />
                {`${file.AniDB.ID} (AniDB)`}
                <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={1} />
              </div>
            </a>
          )}
        </div>
        <Select
          className="flex items-center"
          id="mark-variation"
          value={option}
          onChange={e => setOption(e.target.value)}
        >
          <option value="keep">Will be kept</option>
          <option value="delete">Will be deleted</option>
          <option value="variation">Marked as a Variation</option>
        </Select>
      </div>
      <EpisodeFileInfo file={file} compact />
    </div>
  );
};

const EpisodeItem = ({ episode }: { episode: EpisodeType }) => {
  const [open, toggleOpen] = useToggle(false);

  return (
    <div
      className="flex cursor-pointer flex-col rounded-md border border-panel-border bg-panel-background-alt p-4"
      onClick={() => toggleOpen()}
    >
      <div className="flex">
        {`${episode.AniDB?.EpisodeNumber} - ${episode.Name}`}
        <div className="ml-auto">
          <span className="font-semibold text-panel-text-important">{episode.Files!.length}</span>
          &nbsp;Files
        </div>
        <Icon
          path={mdiChevronDown}
          size={1}
          rotate={open ? 180 : 0}
          className="ml-2 text-panel-text-primary transition-transform"
        />
      </div>
      <AnimateHeight height={open ? 'auto' : 0}>
        {episode.Files!.map(file => <FileItem key={file.ID} file={file} />)}
      </AnimateHeight>
    </div>
  );
};

const EpisodeTable = ({ id: seriesId }: { id: number }) => {
  const episodesData = queryClient.getQueryData<ListResultType<EpisodeType>>(
    [
      'release-management',
      'series',
      'episodes',
      seriesId,
      {
        includeDataFrom: ['AniDB'],
        includeFiles: true,
        includeAbsolutePaths: true,
        includeMediaInfo: true,
      },
    ],
  );
  const episodes = episodesData?.List ?? [];

  return (
    <div className="mt-6 flex flex-col gap-y-2">
      {episodes.filter(episode => episode.Files!.length > 1).map(episode => (
        <EpisodeItem key={episode.IDs.ID} episode={episode} />
      ))}
    </div>
  );
};

const Menu = () => (
  <div className="relative box-border flex grow items-center rounded-md border border-panel-border bg-panel-background-alt px-4 py-3">
    <MenuButton onClick={() => invalidateQueries(['release-management', 'series'])} icon={mdiRefresh} name="Refresh" />
    {/* <span className="ml-auto text-panel-text-important"> */}
    {/*   0 &nbsp; */}
    {/* </span> */}
    {/* Series Selected */}
    {/* {0 === 1 ? 'File ' : 'Files '} */}
  </div>
);

function MultipleFilesUtility() {
  const seriesQuery = useSeriesWithMultipleReleases({ pageSize: 25 });
  const [series, seriesCount] = useFlattenListResult(seriesQuery.data);

  const onExpand = async (id: number) => {
    await prefetchSeriesEpisodesWithMultipleReleasesQuery(
      id,
      {
        includeDataFrom: ['AniDB'],
        includeFiles: true,
        includeAbsolutePaths: true,
        includeMediaInfo: true,
      },
    );
  };

  return (
    <div className="flex grow flex-col gap-y-8 overflow-y-auto">
      <ShokoPanel title="Multiple Files" options={<ItemCount count={seriesCount} series />}>
        <div className="flex items-center gap-x-3">
          <Menu />
          <Button buttonType="primary" className="flex gap-x-2.5 px-4 py-3 font-semibold" disabled={seriesCount === 0}>
            <Icon path={mdiFileDocumentMultipleOutline} size={0.8333} />
            Auto-Delete Multiples
          </Button>
        </div>
      </ShokoPanel>

      <div className="flex grow overflow-y-auto rounded-md border border-panel-border bg-panel-background px-4 py-8">
        {seriesQuery.isPending && (
          <div className="flex grow items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} size={4} spin />
          </div>
        )}

        {!seriesQuery.isPending && seriesCount === 0 && (
          <div className="flex grow items-center justify-center font-semibold">
            No series with multiple files!
          </div>
        )}

        {seriesQuery.isSuccess && seriesCount > 0 && (
          <UtilitiesTable
            ExpandedNode={EpisodeTable}
            columns={colmuns}
            count={seriesCount}
            fetchNextPage={seriesQuery.fetchNextPage}
            isFetchingNextPage={seriesQuery.isFetchingNextPage}
            rows={series}
            onExpand={onExpand}
            skipSort
          />
        )}
      </div>
    </div>
  );
}

export default MultipleFilesUtility;
