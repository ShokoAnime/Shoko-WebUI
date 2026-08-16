import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { mdiLoading, mdiMagnify, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useDebounceValue } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import { useSeriesAniDBSearchQuery } from '@/core/react-query/series/queries';
import { formatThousand, getAnidbAnimeLink } from '@/core/util';

import type { SeriesAniDBSearchResult } from '@/core/types/api/series';

const AnimeResultRow = (
  { data, onSelect }: {
    data: SeriesAniDBSearchResult;
    onSelect: (series: SeriesAniDBSearchResult) => void;
  },
) => (
  <div
    key={data.ID}
    onClick={() => onSelect(data)}
    className="flex cursor-pointer gap-x-2 gap-y-1 hover:text-panel-text-primary"
  >
    <a
      className="flex w-20 shrink-0 font-semibold text-panel-text-primary"
      href={getAnidbAnimeLink(data.ID)}
      target="_blank"
      rel="noopener noreferrer"
    >
      {data.ID}
      <Icon path={mdiOpenInNew} size={0.833} className="ml-auto" />
    </a>
    |
    <div>{data.Title}</div>
    <div className="ml-auto">{data.Type}</div>
    |
    <div className="w-10 shrink-0">{data.EpisodeCount ? formatThousand(data.EpisodeCount) : '-'}</div>
  </div>
);

const AnimeSelectPanel = (
  { onSelect, placeholder, showLoading }: {
    onSelect: (series: SeriesAniDBSearchResult) => void;
    placeholder: string;
    showLoading?: boolean;
  },
) => {
  const [searchText, setSearchText] = useState(placeholder);
  const [debouncedSearch] = useDebounceValue(searchText, 200);
  const searchQuery = useSeriesAniDBSearchQuery(debouncedSearch, !!debouncedSearch);

  useEffect(() => {
    setSearchText(placeholder);
  }, [placeholder]);

  const isLoading = showLoading || (!!debouncedSearch && searchQuery.isPending);

  const searchRows: ReactNode[] = isLoading
    ? [
      <div key="loading" className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} size={4} spin />
      </div>,
    ]
    : (searchQuery.data ?? []).map(data => <AnimeResultRow key={data.ID} data={data} onSelect={onSelect} />);

  return (
    <div className="flex h-full flex-col gap-y-2">
      <Input
        id="series-search"
        type="text"
        value={searchText}
        onChange={event => setSearchText(event.target.value)}
        placeholder="Enter Series Name or AniDB ID..."
        inputClassName="!p-4"
        startIcon={mdiMagnify}
      />
      <div className="flex grow flex-col overflow-y-auto rounded-lg border border-panel-border bg-panel-input p-4">
        {searchRows}
      </div>
    </div>
  );
};

export default AnimeSelectPanel;
