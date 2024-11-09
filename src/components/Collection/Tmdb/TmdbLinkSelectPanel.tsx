import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { mdiFilmstrip, mdiLoading, mdiMagnify, mdiOpenInNew, mdiTelevision } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { toNumber } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import toast from '@/components/Toast';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { useTmdbRefreshMutation } from '@/core/react-query/tmdb/mutations';
import { useTmdbAutoSearchQuery, useTmdbSearchQuery } from '@/core/react-query/tmdb/queries';
import { SeriesTypeEnum } from '@/core/types/api/series';
import useEventCallback from '@/hooks/useEventCallback';

import type { TmdbSearchResultType } from '@/core/types/api/tmdb';

type SearchResultRowProps = {
  linkType: 'Show' | 'Movie';
  result: TmdbSearchResultType;
  selectLink: (tmdbId: number) => void;
};

const SearchResultRow = React.memo(({ linkType, result, selectLink }: SearchResultRowProps) => {
  const handleClick = useEventCallback(() => {
    selectLink(result.ID);
  });

  return (
    <div className="flex items-center gap-x-4">
      <a
        className="flex w-24 cursor-pointer items-center justify-between font-semibold text-panel-text-primary"
        href={`https://www.themoviedb.org/${linkType === 'Show' ? 'tv' : 'movie'}/${result.ID}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {result.ID}
        <Icon path={mdiOpenInNew} size={0.9} />
      </a>
      <div
        className="line-clamp-1 flex cursor-pointer items-center gap-x-4 hover:text-panel-text-primary"
        onClick={handleClick}
      >
        <span>|</span>
        {result.Title}
      </div>
    </div>
  );
});

const TmdbLinkSelectPanel = React.memo(({ seriesType }: { seriesType?: SeriesTypeEnum }) => {
  const { seriesId } = useParams();

  const [, setSearchParams] = useSearchParams();

  const [linkType, setLinkType] = useState<'Show' | 'Movie'>(seriesType === SeriesTypeEnum.Movie ? 'Movie' : 'Show');
  const [selectedId, setSelectedId] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch] = useDebounceValue(searchText, 200);

  const { includeRestricted } = useSettingsQuery().data.WebUI_Settings.collection.tmdb;

  const autoSearchQuery = useTmdbAutoSearchQuery(toNumber(seriesId), debouncedSearch === '' && !!seriesId);
  const autoSearchResults = useMemo(() => {
    if (!autoSearchQuery.data) return [];

    return autoSearchQuery.data
      .filter(result => result.IsMovie === (linkType === 'Movie'))
      .map(result => result[linkType]);
  }, [autoSearchQuery.data, linkType]);

  const searchQuery = useTmdbSearchQuery(linkType, debouncedSearch, {
    includeRestricted,
    pageSize: 25,
  });
  const { isPending: refreshPending, mutate: refreshData } = useTmdbRefreshMutation(linkType);

  const noResults = useMemo(() => {
    if (debouncedSearch === '') return autoSearchResults.length === 0;
    return searchQuery.data?.length === 0;
  }, [autoSearchResults, debouncedSearch, searchQuery.data]);

  const isPending = useMemo(
    () => autoSearchQuery.isLoading || searchQuery.isLoading || refreshPending,
    [autoSearchQuery.isLoading, refreshPending, searchQuery.isLoading],
  );

  const selectLink = useEventCallback((tmdbId: number) => {
    setSelectedId(tmdbId);
  });

  useEffect(() => {
    if (selectedId === 0) return;

    refreshData(
      {
        tmdbId: selectedId,
        Immediate: true,
        SkipIfExists: true,
      },
      {
        onSuccess: () => setSearchParams({ type: linkType, id: selectedId.toString() }),
        onError: () => toast.error('Failed to refresh data!'),
      },
    );
  }, [linkType, refreshData, selectedId, setSearchParams]);

  return (
    <div className="row-span-2 flex flex-col gap-y-2">
      <div className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-background-alt p-4 font-semibold">
        <div className="flex items-center">
          TMDB |&nbsp;
          <div>
            Not linked
          </div>
        </div>
        <div className="flex gap-x-2">
          <Button
            className={cx(
              'flex gap-x-2 item hover:text-panel-text-primary transition-colors',
              linkType === 'Show' && 'text-panel-text-primary',
            )}
            onClick={() => setLinkType('Show')}
          >
            <Icon path={mdiTelevision} size={1} />
            Series
          </Button>
          |
          <Button
            className={cx(
              'flex gap-x-2 hover:text-panel-text-primary transition-colors',
              linkType === 'Movie' && 'text-panel-text-primary',
            )}
            onClick={() => setLinkType('Movie')}
          >
            <Icon path={mdiFilmstrip} size={1} />
            Movie
          </Button>
        </div>
      </div>

      <Input
        id="link-search"
        type="text"
        value={searchText}
        onChange={event => setSearchText(event.target.value)}
        placeholder="Enter Title or TMDB ID..."
        inputClassName="!p-4"
        startIcon={mdiMagnify}
        autoFocus
      />

      <div className="relative h-96 rounded-lg border border-panel-border bg-panel-input p-4">
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} size={4} spin />
          </div>
        )}

        {!isPending && (
          <div
            className={cx(
              'flex h-full flex-col gap-y-2 overflow-y-auto',
              refreshPending && 'opacity-65 pointer-events-none',
            )}
          >
            {debouncedSearch === '' && autoSearchResults.map(result => (
              <SearchResultRow
                key={result.ID}
                result={result}
                linkType={linkType}
                selectLink={selectLink}
              />
            ))}

            {debouncedSearch && searchQuery.data?.map(result => (
              <SearchResultRow
                key={result.ID}
                result={result}
                linkType={linkType}
                selectLink={selectLink}
              />
            ))}

            {noResults && (
              <div className="flex grow items-center justify-center">
                No results found!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default TmdbLinkSelectPanel;
