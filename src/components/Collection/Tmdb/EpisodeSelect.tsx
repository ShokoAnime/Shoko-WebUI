import { useEffect, useMemo, useState } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { mdiChevronDown, mdiLoading, mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { debounce } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import { useMetadataSeriesEpisodesQuery } from '@/core/react-query/metadata/queries';
import { padNumber } from '@/core/util';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { MetadataEpisodeType } from '@/core/types/api/metadata';

type Props = {
  isDisabled: boolean;
  isOdd: boolean;
  /** The source's ID of the series being linked. */
  linkId: string;
  overrideLink: (newEpisodeId?: string) => void;
  source: string;
  linkedEpisode?: MetadataEpisodeType;
  override?: string;
};

const getEpisodeTitle = (episode: MetadataEpisodeType) => episode.Title ?? `Episode ${episode.EpisodeNumber}`;

const getEpisodeNumber = (episode: MetadataEpisodeType) => {
  if (episode.SeasonNumber === 0) return `Special ${padNumber(episode.EpisodeNumber)}`;
  if (episode.SeasonNumber === null) return `E${padNumber(episode.EpisodeNumber)}`;
  return `S${padNumber(episode.SeasonNumber)}E${padNumber(episode.EpisodeNumber)}`;
};

const EpisodeSelect = (props: Props) => {
  const { isDisabled, isOdd, linkId, linkedEpisode: initialEpisode, override, overrideLink, source } = props;

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch] = useDebounceValue(searchText, 200);

  const episodesQuery = useMetadataSeriesEpisodesQuery(source, linkId, {
    search: debouncedSearch,
    pageSize: 30,
  });
  const [episodes, episodeCount] = useFlattenListResult(episodesQuery.data);

  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);

  useEffect(() => {
    if (override && override !== initialEpisode?.ID) {
      const episodeOverride = episodes.find(episode => episode.ID === override);
      if (episodeOverride) {
        setSelectedEpisode(episodeOverride);
      }
      return;
    }

    setSelectedEpisode(initialEpisode);
  }, [episodes, initialEpisode, override]);

  const handleSelect = (newSelectedEpisode?: MetadataEpisodeType) => {
    overrideLink(newSelectedEpisode?.ID ?? '');
  };

  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  // oxlint-disable-next-line react/incompatible-library -- @tanstack/react-virtual attaches refs during render, which is incompatible with the React Compiler
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
        episodesQuery.fetchNextPage().catch(console.error);
      }, 100),
    [episodesQuery],
  );

  return (
    <Listbox
      value={selectedEpisode ?? {}}
      by="ID"
      onChange={handleSelect}
      disabled={isDisabled}
      as="div"
      className="flex grow basis-0"
    >
      <ListboxButton
        className={cx(
          'flex grow items-center gap-x-6 rounded-lg border border-panel-border p-4',
          'data-open:border-panel-text-primary',
          isOdd ? 'bg-panel-background-alt' : 'bg-panel-background',
          isDisabled && 'opacity-65',
        )}
        data-tooltip-id="tooltip"
        data-tooltip-content={isDisabled ? 'Episode is linked to another show.' : ''}
      >
        {({ open }) => (
          <>
            <div className="w-8 shrink-0">
              {/* oxlint-disable-next-line no-nested-ternary -- nested ternary keeps the season label short and readable */}
              {selectedEpisode?.SeasonNumber != null
                ? (selectedEpisode.SeasonNumber === 0 ? 'SP' : `S${padNumber(selectedEpisode.SeasonNumber)}`)
                : 'XX'}
            </div>
            <div className="w-8 shrink-0">
              {selectedEpisode?.EpisodeNumber ? padNumber(selectedEpisode.EpisodeNumber) : 'XX'}
            </div>

            <div
              className="flex grow flex-col text-left"
              data-tooltip-id={!isDisabled ? 'tooltip' : ''}
              data-tooltip-content={selectedEpisode ? getEpisodeTitle(selectedEpisode) : ''}
            >
              <div className="line-clamp-1 text-xs font-semibold opacity-65">
                {selectedEpisode ? selectedEpisode.AirDate ?? 'Airdate Unknown' : ''}
              </div>
              <div className="line-clamp-1">
                {selectedEpisode ? getEpisodeTitle(selectedEpisode) : 'Entry Not Linked'}
              </div>
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
          className="z-110 w-(--button-width) rounded-lg bg-panel-background focus:outline-hidden"
        >
          <Input
            autoFocus
            id="episode-search"
            type="text"
            value={searchText}
            onChange={event => setSearchText(event.target.value)}
            onKeyDown={event => event.stopPropagation()}
            placeholder="Search by number, S1E5, Special 3 or title..."
            inputClassName="!p-4"
            startIcon={mdiMagnify}
          />

          <div className="mt-2 rounded-lg bg-panel-input p-4">
            <div
              className="h-80 w-full flex-col overflow-y-auto"
              ref={setScrollElement}
            >
              {episodesQuery.isPending && (
                <div className="flex size-full items-center justify-center text-panel-text-primary">
                  <Icon path={mdiLoading} spin size={3} />
                </div>
              )}

              {!episodesQuery.isPending && (
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
                          className="absolute top-0 left-0 w-full"
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
                          'absolute top-0 left-0 flex w-full basis-0 cursor-pointer gap-x-2 transition-colors',
                          'group hover:text-panel-text-primary data-selected:text-panel-text-primary',
                        )}
                        style={{
                          transform: `translateY(${start ?? 0}px)`,
                        }}
                        ref={rowVirtualizer.measureElement}
                        data-index={index}
                      >
                        <div className="w-24 text-panel-text-important group-data-selected:text-panel-text-primary">
                          {!episode && 'XX'}

                          {episode && getEpisodeNumber(episode)}
                        </div>
                        |

                        <div
                          className="ml-4 line-clamp-1 grow basis-0"
                          data-tooltip-id="tooltip"
                          data-tooltip-content={episode ? getEpisodeTitle(episode) : ''}
                        >
                          {episode ? getEpisodeTitle(episode) : 'Do Not Link Entry'}
                        </div>

                        <div className="pr-4">
                          {episode?.AirDate ?? ''}
                        </div>
                      </ListboxOption>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ListboxOptions>
      </Transition>
    </Listbox>
  );
};

export default EpisodeSelect;
