import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { mdiLoading, mdiMagnify, mdiOpenInNew, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { toNumber } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import { getAnilistUnavailableMessage, getAnilistUnavailableState } from '@/core/react-query/anilist/helpers';
import { useAnilistRefreshMutation } from '@/core/react-query/anilist/mutations';
import { useAnilistAutoSearchQuery, useAnilistSearchQuery } from '@/core/react-query/anilist/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import toast from '@/core/toast';
import { getAnilistAnimeLink } from '@/core/util';

import type { AnilistSearchResultType } from '@/core/types/api/anilist';

type SearchResultRowProps = {
  result: AnilistSearchResultType;
  selectLink: (anilistId: number) => void;
};

const SearchResultRow = ({ result, selectLink }: SearchResultRowProps) => {
  const handleClick = () => {
    selectLink(result.ID);
  };

  return (
    <div className="flex items-center gap-x-4">
      <a
        className="flex w-24 cursor-pointer items-center justify-between font-semibold text-panel-text-primary"
        href={getAnilistAnimeLink(result.ID)}
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
};

const AnilistLinkSelectPanel = () => {
  const { seriesId } = useParams();

  const [, setSearchParams] = useSearchParams();

  const [selectedId, setSelectedId] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch] = useDebounceValue(searchText, 200);

  const { includeRestricted } = useSettingsQuery().data.WebUI_Settings.collection.anilist;

  const autoSearchQuery = useAnilistAutoSearchQuery(toNumber(seriesId), debouncedSearch === '' && !!seriesId);
  const autoSearchResults = useMemo(
    () => autoSearchQuery.data?.map(result => result.Anime) ?? [],
    [autoSearchQuery.data],
  );

  const searchQuery = useAnilistSearchQuery(debouncedSearch, {
    includeRestricted,
    pageSize: 25,
  });
  const { isPending: refreshPending, mutate: refreshData } = useAnilistRefreshMutation();

  const activeQuery = debouncedSearch === '' ? autoSearchQuery : searchQuery;
  const unavailableState = useMemo(() => getAnilistUnavailableState(activeQuery.error), [activeQuery.error]);

  const noResults = useMemo(() => {
    if (unavailableState) return false;
    if (debouncedSearch === '') return autoSearchResults.length === 0;
    return searchQuery.data?.length === 0;
  }, [autoSearchResults, debouncedSearch, searchQuery.data, unavailableState]);

  const handleRetry = () => {
    activeQuery.refetch().catch(console.error);
  };

  const isPending = useMemo(
    () => autoSearchQuery.isLoading || searchQuery.isLoading || refreshPending,
    [autoSearchQuery.isLoading, refreshPending, searchQuery.isLoading],
  );

  const selectLink = (anilistId: number) => {
    setSelectedId(anilistId);
  };

  useEffect(() => {
    if (selectedId === 0) return;

    refreshData(
      {
        anilistId: selectedId,
        Immediate: true,
        QuickRefresh: true,
      },
      {
        onSuccess: () => setSearchParams({ id: selectedId.toString() }),
        onError: (error) => {
          const state = getAnilistUnavailableState(error);
          toast.error(state ? getAnilistUnavailableMessage(state) : 'Failed to refresh data!');
          setSelectedId(0);
        },
      },
    );
  }, [refreshData, selectedId, setSearchParams]);

  return (
    <div className="row-span-2 flex flex-col gap-y-2">
      <div className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-background-alt p-4 font-semibold">
        <div className="flex items-center">
          AniList |&nbsp;
          <div>
            Not linked
          </div>
        </div>
      </div>

      <Input
        id="link-search"
        type="text"
        value={searchText}
        onChange={event => setSearchText(event.target.value)}
        placeholder="Enter Title or AniList ID..."
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
              refreshPending && 'pointer-events-none opacity-65',
            )}
          >
            {debouncedSearch === '' && autoSearchResults.map(result => (
              <SearchResultRow
                key={result.ID}
                result={result}
                selectLink={selectLink}
              />
            ))}

            {debouncedSearch && searchQuery.data?.map(result => (
              <SearchResultRow
                key={result.ID}
                result={result}
                selectLink={selectLink}
              />
            ))}

            {noResults && (
              <div className="flex grow items-center justify-center">
                No results found!
              </div>
            )}

            {unavailableState && (
              <div className="flex grow flex-col items-center justify-center gap-y-4 text-center">
                {getAnilistUnavailableMessage(unavailableState)}
                <Button
                  buttonType="secondary"
                  buttonSize="normal"
                  className="flex items-center gap-x-2"
                  onClick={handleRetry}
                  loading={activeQuery.isFetching}
                >
                  <Icon path={mdiRefresh} size={1} />
                  Retry
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnilistLinkSelectPanel;
