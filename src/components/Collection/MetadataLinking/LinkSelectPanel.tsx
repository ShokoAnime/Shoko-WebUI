import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { mdiFilmstrip, mdiLoading, mdiMagnify, mdiOpenInNew, mdiTelevision } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { groupBy, map, toNumber, uniq, uniqBy } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import { Badge } from '@/components/Badge';
import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import SelectSmall from '@/components/Input/SelectSmall';
import { isSameKey } from '@/core/react-query/metadata/helpers';
import { useMetadataRefreshMutation } from '@/core/react-query/metadata/mutations';
import { useMetadataSearchQuery, useSeriesMetadataAutoSearchQuery } from '@/core/react-query/metadata/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import toast from '@/core/toast';

import type { MetadataLinkType } from '@/core/react-query/metadata/types';
import type {
  MetadataAutoSearchOriginValues,
  MetadataLinkSourceType,
  MetadataSearchResultType,
} from '@/core/types/api/metadata';
import type { AnimeTypeValues } from '@/core/types/api/series';

const originLabels: Record<MetadataAutoSearchOriginValues, string> = {
  Search: 'Search',
  CurrentLink: 'Current link',
  PrequelLink: 'Prequel link',
  AnidbResource: 'AniDB resource',
  CrossSourceLink: 'Cross-source link',
};

type SearchResultRowProps = {
  origins?: MetadataAutoSearchOriginValues[];
  result: MetadataSearchResultType;
  selectLink: (id: string) => void;
};

const SearchResultRow = ({ origins, result, selectLink }: SearchResultRowProps) => {
  const handleClick = () => {
    selectLink(result.ID);
  };

  return (
    <div className="flex items-center gap-x-4">
      {result.SiteUrl
        ? (
          <a
            className="flex w-24 shrink-0 cursor-pointer items-center justify-between font-semibold text-panel-text-primary"
            href={result.SiteUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="line-clamp-1">{result.ID}</span>
            <Icon className="shrink-0" path={mdiOpenInNew} size={0.9} />
          </a>
        )
        : <div className="line-clamp-1 w-24 shrink-0 font-semibold text-panel-text-primary">{result.ID}</div>}
      <div
        className="line-clamp-1 flex cursor-pointer items-center gap-x-4 hover:text-panel-text-primary"
        onClick={handleClick}
      >
        <span>|</span>
        {result.Title}
      </div>
      {origins && origins.length > 0 && (
        <div className="ml-auto flex shrink-0 gap-x-1">
          {origins.map(origin => (
            <Badge key={origin} className="bg-panel-background-alt whitespace-nowrap">{originLabels[origin]}</Badge>
          ))}
        </div>
      )}
    </div>
  );
};

type Props = {
  seriesType?: AnimeTypeValues;
  source: string;
  sources?: MetadataLinkSourceType[];
};

const LinkSelectPanel = ({ seriesType, source, sources }: Props) => {
  const { seriesId } = useParams();

  const [, setSearchParams] = useSearchParams();

  const sourceInfo = sources?.find(item => isSameKey(item.Source, source));
  const supportsSeries = sourceInfo?.SupportsSeries ?? true;
  const supportsMovies = sourceInfo?.SupportsMovies ?? true;

  const [preferredLinkType, setPreferredLinkType] = useState<MetadataLinkType>(
    seriesType === 'Movie' ? 'Movie' : 'Show',
  );
  let linkType = preferredLinkType;
  if (linkType === 'Show' && !supportsSeries && supportsMovies) linkType = 'Movie';
  if (linkType === 'Movie' && !supportsMovies && supportsSeries) linkType = 'Show';
  const [selectedId, setSelectedId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch] = useDebounceValue(searchText, 200);

  const { includeRestricted } = useSettingsQuery().data.WebUI_Settings.collection.metadata;

  const autoSearchQuery = useSeriesMetadataAutoSearchQuery(
    toNumber(seriesId),
    source,
    debouncedSearch === '' && !!seriesId,
  );
  const autoSearchResults = useMemo(() => {
    if (!autoSearchQuery.data) return [];

    // The server lists every scored candidate, accepted ones first, and may list one entry once per origin,
    // so each entry is shown once with every origin that found it. `uniqBy` keeps the server's order, which
    // `groupBy` would lose by listing numeric IDs in ascending order.
    const candidates = autoSearchQuery.data.filter(
      candidate => (candidate.Result.Type === 'Movie') === (linkType === 'Movie'),
    );
    const candidatesById = groupBy(candidates, candidate => candidate.ID);
    return uniqBy(candidates, candidate => candidate.ID).map(candidate => ({
      origins: uniq(map(candidatesById[candidate.ID], 'Origin')),
      result: candidate.Result,
    }));
  }, [autoSearchQuery.data, linkType]);

  const searchQuery = useMetadataSearchQuery(source, linkType, debouncedSearch, {
    includeRestricted,
    pageSize: 25,
  });
  const { isPending: refreshPending, mutate: refreshData } = useMetadataRefreshMutation(source, linkType);

  const noResults = useMemo(() => {
    if (debouncedSearch === '') return autoSearchResults.length === 0;
    return searchQuery.data?.length === 0;
  }, [autoSearchResults, debouncedSearch, searchQuery.data]);

  const isPending = useMemo(
    () => autoSearchQuery.isLoading || searchQuery.isLoading || refreshPending,
    [autoSearchQuery.isLoading, refreshPending, searchQuery.isLoading],
  );

  const selectLink = (id: string) => {
    setSelectedId(id);
  };

  const changeSource = (newSource: string) => {
    setSelectedId('');
    setSearchParams({ source: newSource });
  };

  useEffect(() => {
    if (selectedId === '') return;

    refreshData(
      {
        id: selectedId,
        Immediate: true,
        SkipIfExists: true,
      },
      {
        onSuccess: () => setSearchParams({ source, type: linkType, id: selectedId }),
        onError: () => toast.error('Failed to refresh data!'),
      },
    );
  }, [linkType, refreshData, selectedId, setSearchParams, source]);

  return (
    <div className="row-span-2 flex flex-col gap-y-2">
      <div className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-background-alt p-4 font-semibold">
        <div className="flex items-center gap-x-2">
          <SelectSmall
            id="link-source"
            value={sourceInfo?.Source ?? source}
            onChange={event => changeSource(event.target.value)}
          >
            {!sourceInfo && <option value={source}>{source}</option>}
            {sources?.map(item => <option key={item.Source} value={item.Source}>{item.Name}</option>)}
          </SelectSmall>
          |
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
            disabled={!supportsSeries}
            onClick={() => setPreferredLinkType('Show')}
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
            disabled={!supportsMovies}
            onClick={() => setPreferredLinkType('Movie')}
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
        placeholder={`Enter Title or ${sourceInfo?.Name ?? source} ID...`}
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
            {debouncedSearch === '' && autoSearchResults.map(({ origins, result }) => (
              <SearchResultRow
                key={result.ID}
                origins={origins}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkSelectPanel;
