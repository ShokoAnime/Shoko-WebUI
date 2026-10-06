import { useState } from 'react';
import cx from 'classnames';
import { useMediaQuery } from 'usehooks-ts';

import { getSlideDirection } from '@/core/utilities/airingSchedule';

import type { SlideDirectionType, SlidingTextType } from '@/core/utilities/airingSchedule';

type SlideType = { count: number, direction: SlideDirectionType, leaving: string | null };

/**
 * Text that slides the old out and the new in, in the direction of travel given by `order`. A new `resetKey`, or reduced
 * motion, swaps the text at once. A change while sliding starts over from the text shown.
 */
const SlidingText = ({ order, resetKey, text }: SlidingTextType) => {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [shown, setShown] = useState<SlidingTextType>({ order, resetKey, text });
  const [slide, setSlide] = useState<SlideType>({ count: 0, direction: 'forward', leaving: null });

  if (shown.order !== order || shown.resetKey !== resetKey || shown.text !== text) {
    const next = { order, resetKey, text };
    const direction = reduceMotion ? null : getSlideDirection(shown, next);
    setShown(next);
    if (direction) setSlide({ count: slide.count + 1, direction, leaving: shown.text });
    else if (slide.leaving !== null) setSlide({ ...slide, leaving: null });
  }

  const isSliding = slide.leaving !== null;
  const isForward = slide.direction === 'forward';

  // Both texts share one grid cell, so the box takes the wider while they slide.
  return (
    <span className="inline-grid justify-items-start overflow-hidden whitespace-nowrap">
      {isSliding && (
        <span
          key={`leaving-${slide.count}`}
          aria-hidden
          className={cx(
            'col-start-1 row-start-1',
            isForward ? 'animate-slide-out-to-left' : 'animate-slide-out-to-right',
          )}
          onAnimationEnd={() => setSlide(current => ({ ...current, leaving: null }))}
        >
          {slide.leaving}
        </span>
      )}
      <span
        key={slide.count}
        className={cx(
          'col-start-1 row-start-1',
          isSliding && (isForward ? 'animate-slide-in-from-right' : 'animate-slide-in-from-left'),
        )}
      >
        {shown.text}
      </span>
    </span>
  );
};

export default SlidingText;
