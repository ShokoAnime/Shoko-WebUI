import type { ReactNode } from 'react';
import cx from 'classnames';

// The first third in full, the second almost, the last just a hint.
const fadeMask = 'linear-gradient(to bottom, black 30%, rgb(0 0 0 / 0.35) 66%, transparent)';

/** Fades its content in as it mounts, so it takes over from a skeleton without popping in. */
export const FadeIn = ({ children, className }: { children: ReactNode, className?: string }) => (
  <div className={cx('transition-opacity duration-200 motion-reduce:transition-none starting:opacity-0', className)}>
    {children}
  </div>
);

/** A placeholder for a line of text or an image; its size and shape come from the class names. */
export const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={cx('max-w-full rounded-sm bg-panel-input', className)} />
);

/**
 * A pulsing stand-in for a view while it loads, rows of placeholder cards fading out downwards. It fades in a
 * moment late, so a quick load never flashes it. The class names lay out the cards, the same as the real ones. A
 * quiet one, one of many in a grid that says it is busy, is hidden from assistive technology.
 */
export const SkeletonFade = (
  { children, className, quiet = false }: { children: ReactNode, className?: string, quiet?: boolean },
) => (
  <div
    role={quiet ? undefined : 'status'}
    aria-label={quiet ? undefined : 'Loading'}
    aria-hidden={quiet || undefined}
    className="transition-opacity delay-150 duration-300 starting:opacity-0"
    style={{ maskImage: fadeMask }}
  >
    <div className={cx('animate-pulse motion-reduce:animate-none', className)}>
      {children}
    </div>
  </div>
);

/**
 * The rest of a skeleton below content shorter than it, kept still: its placeholders where the skeleton had them, under
 * the bottom of its fade. `height` is the whole skeleton's.
 */
export const SkeletonRest = (
  { children, className, height }: { children: ReactNode, className?: string, height: number },
) => (
  <div
    aria-hidden
    className={className}
    style={{ maskImage: fadeMask, maskSize: `100% ${height}px`, maskPosition: 'bottom', maskRepeat: 'no-repeat' }}
  >
    {children}
  </div>
);
