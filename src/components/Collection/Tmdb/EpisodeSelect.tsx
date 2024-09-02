import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { mdiChevronDown, mdiLoading, mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { debounce, toNumber } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import { useTmdbShowEpisodesQuery } from '@/core/react-query/tmdb/queries';
import { padNumber } from '@/core/util';
import useEventCallback from '@/hooks/useEventCallback';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { TmdbEpisodeType } from '@/core/types/api/tmdb';

type Props = {
  isOdd: boolean;
  overrideLink: (newTmdbId?: number) => void;
  override: number;
  tmdbEpisode?: TmdbEpisodeType;
};

const EpisodeSelect = React.memo((props: Props) => {
  const { isOdd, override, overrideLink, tmdbEpisode: initialTmdbEpisode } = props;
  const [searchParams] = useSearchParams();
  const tmdbId = toNumber(searchParams.get('id'));

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch] = useDebounceValue(searchText, 200);

  const { fetchNextPage: fetchNextEpisodesPage, ...episodesQuery } = useTmdbShowEpisodesQuery(tmdbId, {
    search: debouncedSearch,
    pageSize: 30,
  });
  const [episodes, episodeCount] = useFlattenListResult(episodesQuery.data);

  const [tmdbEpisode, setTmdbEpisode] = useState(initialTmdbEpisode);

  useEffect(() => {
    if (override === 0) {
      setTmdbEpisode(undefined);
      return;
    }

    if (override) {
      const episodeOverride = episodes.find(episode => episode.ID === override);
      if (episodeOverride) {
        setTmdbEpisode(episodeOverride);
        return;
      }
    }

    setTmdbEpisode(initialTmdbEpisode);
  }, [episodes, initialTmdbEpisode, override]);

  const handleSelect = useEventCallback((newSelectedEpisode?: TmdbEpisodeType) => {
    if (!newSelectedEpisode) {
      if (override === 0) {
        // This resets the link to the initial state
        overrideLink(initialTmdbEpisode?.ID);
        setTmdbEpisode(initialTmdbEpisode);
      } else {
        overrideLink(initialTmdbEpisode ? 0 : undefined);
        setTmdbEpisode(undefined);
      }
      return;
    }

    overrideLink(newSelectedEpisode.ID);
    setTmdbEpisode(newSelectedEpisode);
  });

  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: episodeCount + 1,
    getScrollElement: () => scrollElement,
    estimateSize: () => 26,
    overscan: 5,
    gap: 8,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  const fetchNextPageDebounced = useMemo(
    () =>
      debounce(() => {
        fetchNextEpisodesPage().catch(() => {});
      }, 100),
    [fetchNextEpisodesPage],
  );

  return (
    <Listbox value={tmdbEpisode ?? {}} by="ID" onChange={handleSelect}>
      <ListboxButton
        className={cx(
          'flex grow basis-0 gap-x-6 rounded-lg border border-panel-border p-4',
          'data-[open]:border-panel-text-primary',
          isOdd ? 'bg-panel-background-alt' : 'bg-panel-background',
        )}
      >
        {({ open }) => (
          <>
            <div className="w-8 shrink-0">
              {/* eslint-disable-next-line no-nested-ternary */}
              {tmdbEpisode?.SeasonNumber != null
                ? (tmdbEpisode.SeasonNumber === 0 ? 'SP' : `S${padNumber(tmdbEpisode.SeasonNumber)}`)
                : 'XX'}
            </div>
            <div className="w-8 shrink-0">
              {tmdbEpisode?.EpisodeNumber ? padNumber(tmdbEpisode.EpisodeNumber) : 'XX'}
            </div>
            <div className="line-clamp-1 grow text-left">
              {tmdbEpisode?.Title ?? 'Entry Not Linked'}
            </div>

            <Icon path={mdiChevronDown} size={1} className="shrink-0 transition-transform" rotate={open ? 180 : 0} />
          </>
        )}
      </ListboxButton>
      <Transition
        enter="transition-opacity"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <ListboxOptions
          anchor={{
            to: 'bottom',
            padding: '1rem',
            gap: '0.5rem',
          }}
          className="z-[110] w-[var(--button-width)] rounded-lg bg-panel-background focus:outline-none"
        >
          <Input
            id="episode-search"
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onKeyDown={e => e.stopPropagation()}
            placeholder="Enter Episode Title or Season/Episode Number..."
            inputClassName="!p-4"
            startIcon={mdiMagnify}
          />

          <div className="mt-2 rounded-lg bg-panel-input p-4">
            <div
              className="h-80 w-full flex-col overflow-y-auto"
              ref={setScrollElement}
            >
              <div
                className="relative w-full"
                style={{ height: rowVirtualizer.getTotalSize() }}
              >
                {virtualItems.map((virtualItem) => {
                  const { index, key, start } = virtualItem;

                  const episode = index === 0 ? undefined : episodes[index - 1];

                  if (index !== 0 && !episode && !episodesQuery.isFetchingNextPage) fetchNextPageDebounced();

                  if (index !== 0 && !episode) {
                    return (
                      <div
                        key={`loading-${key}`}
                        className="absolute left-0 top-0 w-full"
                        style={{
                          transform: `translateY(${start ?? 0}px)`,
                        }}
                        ref={rowVirtualizer.measureElement}
                        data-index={index}
                      >
                        <Icon path={mdiLoading} spin size={1} className="m-auto text-panel-text-primary" />
                      </div>
                    );
                  }

                  return (
                    <ListboxOption
                      key={episode?.ID ?? 'entry-not-linked'}
                      value={episode}
                      className={cx(
                        'absolute left-0 top-0 flex w-full basis-0 cursor-pointer gap-x-2 transition-colors',
                        'hover:text-panel-text-primary data-[selected]:text-panel-text-primary group',
                      )}
                      style={{
                        transform: `translateY(${start ?? 0}px)`,
                      }}
                      ref={rowVirtualizer.measureElement}
                      data-index={index}
                    >
                      <div className="w-24 text-panel-text-important group-data-[selected]:text-panel-text-primary">
                        {!episode && 'XX'}

                        {episode && (episode.SeasonNumber === 0
                          ? `Special ${padNumber(episode.EpisodeNumber)}`
                          : `S${padNumber(episode.SeasonNumber)}E${padNumber(episode.EpisodeNumber)}`)}
                      </div>
                      |
                      <div className="ml-4 line-clamp-1 grow basis-0">
                        {episode?.Title ?? 'Do Not Link Entry'}
                      </div>
                      <div className="pr-4">
                        {episode?.AiredAt ?? ''}
                      </div>
                    </ListboxOption>
                  );
                })}
              </div>
            </div>
          </div>
        </ListboxOptions>
      </Transition>
    </Listbox>
  );
});

export default EpisodeSelect;
