import { useRef, useState } from 'react';
import type { KeyboardEvent, TouchEvent, TransitionEvent } from 'react';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { useMediaQuery } from 'usehooks-ts';

import {
  getCurrentSeason,
  getSeasonIndex,
  seasonKeyToString,
  seasonKeyToValue,
  shiftSeason,
} from '@/core/utilities/season';
import { getSeasonSlides, getSlideBounds } from '@/core/utilities/seasonSlider';
import useNow from '@/hooks/useNow';

import type { SeasonKey } from '@/core/utilities/season';
import type { SeasonSlideType } from '@/core/utilities/seasonSlider';

type Props = {
  /** The listed seasons, oldest first; empty until they load. */
  strip: SeasonSlideType[];
  season: SeasonKey;
  /** Whether the season browser is open, which the shown season toggles. */
  isBrowsing: boolean;
  onBrowseToggle: () => void;
  onSeasonChange: (season: SeasonKey) => void;
};

// The seasons drawn on each side of the focused one. Two and a half are in view, so the third slides in unseen.
const sideCount = 3;

// A farther jump lands at once, rather than sweeping past seasons that are not drawn.
const maxSlideDistance = 8;

// How far a touch has to travel sideways before it counts as a swipe, in pixels.
const swipeThreshold = 30;

// Both sides fade out; the outer slides, half past the edges, all but vanish.
const fadeMask = 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)';

type FlipType = 'out' | 'in' | null;

/**
 * The hint under the shown season, which flips over like a card when the browser opens or closes: the old text turns
 * away edge-on, then the new one turns in from the other side, so neither is seen mirrored. Hidden, keeping its place,
 * while the slider is stuck to the top of the page, which the season view marks with `data-stuck` on the slider's block.
 */
const BrowseHint = ({ isBrowsing }: { isBrowsing: boolean }) => {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isTouch = useMediaQuery('(pointer: coarse)');
  const [shown, setShown] = useState(isBrowsing);
  const [flip, setFlip] = useState<FlipType>(null);
  if (reduceMotion && (shown !== isBrowsing || flip !== null)) {
    setShown(isBrowsing);
    setFlip(null);
  } else if (!reduceMotion && shown !== isBrowsing && flip !== 'out') setFlip('out');

  const handleAnimationEnd = () => {
    if (flip === 'out') {
      setShown(isBrowsing);
      setFlip('in');
    } else setFlip(null);
  };

  return (
    <div
      aria-hidden
      className="flex h-4 justify-center perspective-near in-data-stuck:opacity-0"
    >
      <span
        className={cx(
          'flex items-center gap-x-1 text-xs opacity-65',
          flip === 'out' && 'animate-flip-out',
          flip === 'in' && 'animate-flip-in',
        )}
        onAnimationEnd={handleAnimationEnd}
      >
        <Icon path={shown ? mdiChevronUp : mdiChevronDown} size="1rem" />
        {`${isTouch ? 'Tap' : 'Click'} to ${shown ? 'close' : 'open'}`}
      </span>
    </div>
  );
};

/**
 * The seasons as a strip that slides to keep the shown one in the middle, two more on each side, the outer two cut by
 * the edges. A side season is picked by a click, the arrow keys or a swipe, and the strip stops at its ends. The shown
 * season opens and closes the season browser.
 */
const SeasonSlider = ({ isBrowsing, onBrowseToggle, onSeasonChange, season, strip }: Props) => {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const now = useNow();
  const focusIndex = getSeasonIndex(season);
  const bounds = getSlideBounds(strip, season);

  // The season the strip rests on. While it slides from there to the focused one, the seasons between stay drawn.
  const [restIndex, setRestIndex] = useState(focusIndex);
  const distance = Math.abs(focusIndex - restIndex);
  const isSliding = !reduceMotion && distance > 0 && distance <= maxSlideDistance;
  // A jump too far to slide, or any jump without motion, lands at once.
  if (!isSliding && restIndex !== focusIndex) setRestIndex(focusIndex);

  const fromIndex = Math.max(Math.min(focusIndex, restIndex) - sideCount, bounds?.first ?? -Infinity);
  const toIndex = Math.min(Math.max(focusIndex, restIndex) + sideCount, bounds?.last ?? Infinity);
  const slides = getSeasonSlides(strip, fromIndex, toIndex, getCurrentSeason(now.toDate()));

  const moveTo = (index: number) => {
    const target = bounds ? Math.min(Math.max(index, bounds.first), bounds.last) : index;
    if (target !== focusIndex) onSeasonChange(shiftSeason(season, target - focusIndex));
  };

  // The focus follows the shown season as the strip moves, as it is the only season to take it.
  const sliderRef = useRef<HTMLDivElement>(null);
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

  const touchStart = useRef<{ x: number, y: number } | null>(null);
  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  };
  // A swipe moves a season per slot width travelled, at least one; a mostly vertical one scrolls the page instead.
  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const deltaX = event.changedTouches[0].clientX - start.x;
    const deltaY = event.changedTouches[0].clientY - start.y;
    if (Math.abs(deltaX) < swipeThreshold || Math.abs(deltaX) < Math.abs(deltaY)) return;
    const slotWidth = event.currentTarget.clientWidth / 4;
    moveTo(focusIndex - Math.sign(deltaX) * Math.max(1, Math.round(Math.abs(deltaX) / slotWidth)));
  };

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && event.propertyName === 'transform') setRestIndex(focusIndex);
  };

  // The hint under the pill is hidden from assistive technology, so the pill says what it does after its season.
  const toggleAction = isBrowsing ? 'close season browser' : 'browse all seasons';

  // The middle slot is a quarter of the width, so the two beside it fit whole and the outer two show their inner half.
  // Only the seasons take the pointer, so a parent that lets it through leaves the hint's place to what lies below.
  return (
    <div className="flex shrink-0 flex-col gap-y-1">
      <div
        ref={sliderRef}
        role="group"
        aria-label="Seasons"
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="pointer-events-auto relative h-20 touch-pan-y overflow-hidden sm:h-14"
        style={{ maskImage: fadeMask }}
      >
        <div
          className={cx(
            'absolute inset-y-0 left-[37.5%] w-1/4',
            isSliding && 'transition-transform duration-300 ease-out',
          )}
          style={{ transform: `translateX(${(restIndex - focusIndex) * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((slide) => {
            const index = getSeasonIndex(slide.key);
            const offset = Math.abs(index - focusIndex);
            return (
              <div
                key={seasonKeyToValue(slide.key)}
                className="absolute inset-y-0 w-full px-1"
                style={{ left: `${(index - restIndex) * 100}%` }}
              >
                <button
                  ref={offset === 0 ? attachToggle : undefined}
                  type="button"
                  tabIndex={offset === 0 ? 0 : -1}
                  onClick={() => (offset === 0 ? onBrowseToggle() : moveTo(index))}
                  aria-current={offset === 0 ? 'true' : undefined}
                  aria-expanded={offset === 0 ? isBrowsing : undefined}
                  aria-label={offset === 0 ? `${seasonKeyToString(slide.key)}, ${toggleAction}` : undefined}
                  className={cx(
                    'flex size-full flex-wrap content-center items-center justify-center gap-x-2 rounded-lg border border-panel-border px-2 text-center text-sm shadow-sm outline-hidden transition-[scale,opacity,background-color,color,box-shadow] duration-300 ease-out motion-reduce:transition-none',
                    offset === 0
                      ? 'bg-panel-toggle-background! text-panel-toggle-text ring-panel-icon-action ring-inset hover:ring-1 focus-visible:ring-2'
                      : 'bg-panel-background text-panel-toggle-text-alt hover:bg-panel-toggle-background-hover',
                    offset === 1 && 'scale-90 opacity-85',
                    offset >= 2 && 'scale-80 opacity-65',
                  )}
                >
                  <span className="font-semibold">{seasonKeyToString(slide.key)}</span>
                  <span className="flex items-center gap-x-2 text-xs font-semibold">
                    {slide.isCurrent && <span className="text-panel-text-primary">Now</span>}
                    {slide.count !== undefined && <span className="opacity-65">{slide.count}</span>}
                    {!slide.isAnnounced && <span className="opacity-65">TBD</span>}
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
