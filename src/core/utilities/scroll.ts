import { elementScroll } from '@tanstack/react-virtual';

/** How far down the scroll container's content an element starts. */
export const getOffsetIn = (element: HTMLElement | null, container: HTMLElement | null) => (element && container
  ? element.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
  : 0);

/**
 * A virtualizer's `scrollToFn` that leaves out a scroll to where the element already is, such as the one a virtualizer
 * makes as it mounts, which would only stop a smooth scroll on its way.
 */
export const scrollUnlessThere: typeof elementScroll = (offset, options, instance) => {
  const target = offset + (options.adjustments ?? 0);
  if (instance.scrollElement && Math.abs(instance.scrollElement.scrollTop - target) < 1) return;
  elementScroll(offset, options, instance);
};
