import { useMemo, useState } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { mdiChevronDown, mdiLoading, mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { find } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import { dayjs, padNumber } from '@/core/util';

import type { AnilistEpisodeType } from '@/core/types/api/anilist';

type Props = {
  anilistEpisode?: AnilistEpisodeType;
  anilistEpisodes?: AnilistEpisodeType[];
  fallbackEpisodeNumber?: number;
  isDisabled: boolean;
  isOdd: boolean;
  override?: number;
  overrideLink: (newAnilistId?: number) => void;
};

const getAiredAt = (episode?: AnilistEpisodeType) => {
  if (!episode) return '';
  if (!episode.AiredAt) return 'Airdate Unknown';
  return dayjs(episode.AiredAt).format('YYYY-MM-DD');
};

const EpisodeSelect = (props: Props) => {
  const {
    anilistEpisode: initialAnilistEpisode,
    anilistEpisodes,
    fallbackEpisodeNumber,
    isDisabled,
    isOdd,
    override,
    overrideLink,
  } = props;

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch] = useDebounceValue(searchText, 200);

  const episodes = useMemo(() => {
    const search = debouncedSearch.trim().toLowerCase();
    if (!anilistEpisodes) return [];
    if (!search) return anilistEpisodes;
    return anilistEpisodes.filter(episode =>
      episode.EpisodeNumber.toString().includes(search)
      || `episode ${episode.EpisodeNumber}`.includes(search)
    );
  }, [anilistEpisodes, debouncedSearch]);

  const anilistEpisode = useMemo(() => {
    if (override && override !== initialAnilistEpisode?.ID) {
      return find(anilistEpisodes, { ID: override }) ?? initialAnilistEpisode;
    }
    return initialAnilistEpisode;
  }, [anilistEpisodes, initialAnilistEpisode, override]);

  const handleSelect = (newSelectedEpisode?: AnilistEpisodeType) => {
    overrideLink(newSelectedEpisode?.ID ?? 0);
  };

  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: episodes.length + 1,
    getScrollElement: () => scrollElement,
    estimateSize: () => 26,
    overscan: 5,
    gap: 8,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  const episodeNumber = anilistEpisode?.EpisodeNumber ?? fallbackEpisodeNumber;
  const episodeTitle = episodeNumber ? `Episode ${episodeNumber}` : undefined;

  return (
    <Listbox
      value={anilistEpisode ?? {}}
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
        data-tooltip-content={isDisabled ? 'Episode is linked to another anime.' : ''}
      >
        {({ open }) => (
          <>
            <div className="w-8 shrink-0">
              {episodeNumber ? padNumber(episodeNumber) : 'XX'}
            </div>

            <div
              className="flex grow flex-col text-left"
              data-tooltip-id={!isDisabled ? 'tooltip' : ''}
              data-tooltip-content={episodeTitle ?? ''}
            >
              <div className="line-clamp-1 text-xs font-semibold opacity-65">
                {episodeTitle ? getAiredAt(anilistEpisode) : ''}
              </div>
              <div className="line-clamp-1">
                {episodeTitle ?? 'Entry Not Linked'}
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
            placeholder="Enter Episode Number..."
            inputClassName="!p-4"
            startIcon={mdiMagnify}
          />

          <div className="mt-2 rounded-lg bg-panel-input p-4">
            <div
              className="h-80 w-full flex-col overflow-y-auto"
              ref={setScrollElement}
            >
              {!anilistEpisodes && (
                <div className="flex size-full items-center justify-center text-panel-text-primary">
                  <Icon path={mdiLoading} spin size={3} />
                </div>
              )}

              {anilistEpisodes && (
                <div
                  className="relative w-full"
                  style={{ height: rowVirtualizer.getTotalSize() }}
                >
                  {virtualItems.map((virtualItem) => {
                    const { index, key, start } = virtualItem;

                    const episode = index === 0 ? undefined : episodes[index - 1];

                    return (
                      <ListboxOption
                        key={episode?.ID ?? `entry-not-linked-${key}`}
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
                          {episode ? `E${padNumber(episode.EpisodeNumber)}` : 'XX'}
                        </div>
                        |

                        <div
                          className="ml-4 line-clamp-1 grow basis-0"
                          data-tooltip-id="tooltip"
                          data-tooltip-content={episode ? `Episode ${episode.EpisodeNumber}` : ''}
                        >
                          {episode ? `Episode ${episode.EpisodeNumber}` : 'Do Not Link Entry'}
                        </div>

                        <div className="pr-4">
                          {episode?.AiredAt ? getAiredAt(episode) : ''}
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
