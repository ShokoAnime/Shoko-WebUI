import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { mdiFilmstrip, mdiLoading, mdiMagnify, mdiOpenInNew, mdiTelevision } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { find, groupBy, map, startCase, toNumber, uniq, uniqBy } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import { Badge } from '@/components/Badge';
import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { useTmdbRefreshMutation } from '@/core/react-query/tmdb/mutations';
import { useTmdbAutoSearchQuery, useTmdbSearchQuery } from '@/core/react-query/tmdb/queries';
import toast from '@/core/toast';

import type { AnimeTypeValues } from '@/core/types/api/series';
import type {
  TmdbAutoSearchOriginType,
  TmdbAutoSearchRejectionType,
  TmdbSearchResultType,
} from '@/core/types/api/tmdb';

const originLabels: Record<TmdbAutoSearchOriginType, string> = {
  Search: 'Search',
  CurrentLink: 'Current link',
  PrequelLink: 'Prequel link',
  AnidbResource: 'AniDB resource',
  CrossSourceLink: 'Cross-source link',
};

// Short labels and fallback explanations for the server's `MatchRejectionReason` values.
const rejectionLabels: Record<string, { description: string, label: string }> = {
  Outranked: { label: 'Outranked', description: 'Another candidate matched as well and was taken first.' },
  TitleMismatch: { label: 'Title mismatch', description: 'Its titles did not match closely enough.' },
  DateMismatch: { label: 'Date mismatch', description: 'Its titles matched, but its dates did not.' },
  EpisodeCountMismatch: { label: 'Episode count', description: 'Its episode count was further off.' },
  TypeMismatch: { label: 'Type mismatch', description: 'It is a kind of release the anime is not.' },
  Restricted: { label: 'Restricted', description: 'It is marked as adult, and adult entries are not allowed.' },
  ClaimedElsewhere: { label: 'Linked elsewhere', description: 'Another anime already claims it.' },
  KindDisabled: { label: 'Kind disabled', description: 'Linking this kind of entry automatically is turned off.' },
  InvalidID: { label: 'Invalid ID', description: 'It names no entry that can be linked to the anime.' },
  ExistingLink: { label: 'Existing link', description: 'Listed for context: a link the anime or a prequel has.' },
  HintNotNeeded: { label: 'Hint not used', description: 'A hint the automatic search did not need to take.' },
  Other: { label: 'Not linked', description: 'The automatic search would not link it.' },
};

const getRejectionInfo = ({ Details, Reason }: TmdbAutoSearchRejectionType) => {
  const known = rejectionLabels[Reason] as { description: string, label: string } | undefined;
  const why = Details ?? known?.description ?? 'The automatic search would not link it.';
  return {
    label: known?.label ?? startCase(Reason),
    description: `${why} It can still be linked by hand.`,
  };
};

type SearchResultRowProps = {
  linkType: 'Show' | 'Movie';
  origins?: TmdbAutoSearchOriginType[];
  rejection?: TmdbAutoSearchRejectionType | null;
  result: TmdbSearchResultType;
  selectLink: (tmdbId: number) => void;
};

const SearchResultRow = ({ linkType, origins, rejection, result, selectLink }: SearchResultRowProps) => {
  const handleClick = () => {
    selectLink(result.ID);
  };

  const rejectionInfo = rejection ? getRejectionInfo(rejection) : null;

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
      {((origins && origins.length > 0) || rejectionInfo) && (
        <div className="ml-auto flex shrink-0 gap-x-1">
          {rejectionInfo && (
            <span
              className="flex"
              data-tooltip-id="tooltip"
              data-tooltip-content={rejectionInfo.description}
              data-tooltip-class-name="max-w-md"
              data-tooltip-delay-show={500}
            >
              <Badge className="border border-panel-text-warning bg-panel-background-alt whitespace-nowrap text-panel-text-warning opacity-80">
                {rejectionInfo.label}
              </Badge>
            </span>
          )}
          {origins?.map(origin => (
            <Badge key={origin} className="bg-panel-background-alt whitespace-nowrap">{originLabels[origin]}</Badge>
          ))}
        </div>
      )}
    </div>
  );
};

const TmdbLinkSelectPanel = ({ seriesType }: { seriesType?: AnimeTypeValues }) => {
  const { seriesId } = useParams();

  const [, setSearchParams] = useSearchParams();

  const [linkType, setLinkType] = useState<'Show' | 'Movie'>(seriesType === 'Movie' ? 'Movie' : 'Show');
  const [selectedId, setSelectedId] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch] = useDebounceValue(searchText, 200);

  const { includeRestricted } = useSettingsQuery().data.WebUI_Settings.collection.tmdb;

  const autoSearchQuery = useTmdbAutoSearchQuery(toNumber(seriesId), debouncedSearch === '' && !!seriesId);
  const autoSearchResults = useMemo(() => {
    if (!autoSearchQuery.data) return [];

    // The server lists every scored candidate, accepted ones first, and may list one entry once per origin,
    // so each entry is shown once with every origin that found it. It counts as rejected only when every
    // origin's entry is, and then shows the first rejection.
    const candidates = autoSearchQuery.data.filter(result => result.IsMovie === (linkType === 'Movie'));
    const candidatesById = groupBy(candidates, candidate => candidate[linkType].ID);
    return uniqBy(candidates, candidate => candidate[linkType].ID).map((candidate) => {
      const group = candidatesById[candidate[linkType].ID];
      return {
        origins: uniq(map(group, 'Origin')),
        rejection: find(group, entry => entry.Rejection === null) ? null : candidate.Rejection,
        result: candidate[linkType],
      };
    });
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

  const selectLink = (tmdbId: number) => {
    setSelectedId(tmdbId);
  };

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
              'flex gap-x-2 transition-colors hover:text-panel-text-primary',
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
              'flex gap-x-2 transition-colors hover:text-panel-text-primary',
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
              refreshPending && 'pointer-events-none opacity-65',
            )}
          >
            {debouncedSearch === '' && autoSearchResults.map(({ origins, rejection, result }) => (
              <SearchResultRow
                key={result.ID}
                origins={origins}
                rejection={rejection}
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
};

export default TmdbLinkSelectPanel;
