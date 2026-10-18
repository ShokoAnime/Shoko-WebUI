import { useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { clamp, range } from 'lodash';
import { useMediaQuery } from 'usehooks-ts';

import {
  getSeasonBounds,
  getSeasonIndex,
  seasonKeyToString,
  seasonKeyToValue,
  shiftSeason,
} from '@/core/utilities/season';

import type { SeasonSummaryType } from '@/core/react-query/airing-schedule/types';
import type { SeasonKey } from '@/core/types/api/airing-season';

type Props = {
  isBrowsing: boolean;
  onBrowseToggle: () => void;
  onSeasonChange: (season: SeasonKey) => void;
  season: SeasonKey;
  seasons: SeasonSummaryType[];
};

// The seasons drawn on each side of the shown one. Two and a half are in view, so the third comes in unseen.
const sideCount = 3;

const fadeMask = 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)';

/** The hint under the shown season. The two texts turn over like a card, the incoming one once the other is edge-on. */
const BrowseHint = ({ isBrowsing }: { isBrowsing: boolean }) => {
  const isTouch = useMediaQuery('(pointer: coarse)');
  return (
    <div aria-hidden className="relative flex h-4 justify-center text-xs opacity-65 perspective-near">
      {[false, true].map(browsing => (
        <span
          key={String(browsing)}
          className={cx(
            'absolute flex items-center gap-x-1 transition-transform duration-150 motion-reduce:transition-none',
            isBrowsing === browsing ? 'delay-150' : 'rotate-x-90',
          )}
        >
          <Icon path={browsing ? mdiChevronUp : mdiChevronDown} size="1rem" />
          {`${isTouch ? 'Tap' : 'Click'} to ${browsing ? 'close' : 'open'}`}
        </span>
      ))}
    </div>
  );
};

const SeasonSlider = ({ isBrowsing, onBrowseToggle, onSeasonChange, season, seasons }: Props) => {
  const focusIndex = getSeasonIndex(season);
  const bounds = getSeasonBounds(seasons, season);
  const summaries = new Map(seasons.map(item => [getSeasonIndex(item.key), item]));
  const sliderRef = useRef<HTMLDivElement>(null);

  const moveTo = (index: number) => {
    const target = clamp(index, bounds.first, bounds.last);
    if (target !== focusIndex) onSeasonChange(shiftSeason(season, target - focusIndex));
  };

  // The focus follows the shown season as the strip moves, as it is the only season to take it.
  const attachToggle = (toggle: HTMLButtonElement | null) => {
    if (toggle && toggle !== document.activeElement && sliderRef.current?.contains(document.activeElement)) {
      toggle.focus({ preventScroll: true });
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') moveTo(focusIndex - 1);
    else if (event.key === 'ArrowRight') moveTo(focusIndex + 1);
    else return;
    event.preventDefault();
  };

  const toggleAction = isBrowsing ? 'close season browser' : 'browse all seasons';

  // The middle slot is a quarter of the width, so the two beside it fit whole and the outer two show their inner half.
  // Each season keeps its place in the strip, so a changed shown season slides them with a transition on `left`.
  return (
    <div className="flex shrink-0 flex-col gap-y-1">
      <div
        ref={sliderRef}
        role="group"
        aria-label="Seasons"
        onKeyDown={handleKeyDown}
        className="relative h-14 overflow-hidden"
        style={{ maskImage: fadeMask }}
      >
        <div className="absolute inset-y-0 left-[37.5%] w-1/4">
          {range(
            Math.max(focusIndex - sideCount, bounds.first),
            Math.min(focusIndex + sideCount, bounds.last) + 1,
          ).map((index) => {
            const key = shiftSeason(season, index - focusIndex);
            const summary = summaries.get(index);
            const offset = Math.abs(index - focusIndex);
            return (
              <div
                key={seasonKeyToValue(key)}
                className="absolute inset-y-0 w-full px-1 transition-[left] duration-300 ease-out motion-reduce:transition-none"
                style={{ left: `${(index - focusIndex) * 100}%` }}
              >
                <button
                  ref={offset === 0 ? attachToggle : undefined}
                  type="button"
                  tabIndex={offset === 0 ? 0 : -1}
                  onClick={() => (offset === 0 ? onBrowseToggle() : moveTo(index))}
                  aria-current={offset === 0 ? 'true' : undefined}
                  aria-expanded={offset === 0 ? isBrowsing : undefined}
                  aria-label={offset === 0 ? `${seasonKeyToString(key)}, ${toggleAction}` : undefined}
                  className={cx(
                    'flex size-full flex-wrap content-center items-center justify-center gap-x-2 px-2',
                    'rounded-lg border border-panel-border text-center text-sm shadow-sm outline-hidden',
                    'transition-[scale,opacity,background-color,color,box-shadow] duration-300 ease-out',
                    'motion-reduce:transition-none',
                    offset === 0
                      ? 'bg-panel-toggle-background! text-panel-toggle-text ring-panel-icon-action ring-inset hover:ring-1 focus-visible:ring-2'
                      : 'bg-panel-background text-panel-toggle-text-alt hover:bg-panel-toggle-background-hover',
                    offset === 1 && 'scale-90 opacity-85',
                    offset >= 2 && 'scale-80 opacity-65',
                  )}
                >
                  <span className="font-semibold">{seasonKeyToString(key)}</span>
                  <span className="flex items-center gap-x-2 text-xs font-semibold">
                    {summary?.isCurrent && <span className="text-panel-text-primary">Now</span>}
                    <span className="opacity-65">{summary?.count ?? (index > bounds.lastListed ? 'TBD' : 0)}</span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <BrowseHint isBrowsing={isBrowsing} />
    </div>
  );
};

export default SeasonSlider;
