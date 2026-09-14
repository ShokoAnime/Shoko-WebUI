import type { RefObject } from 'react';

import type { Virtualizer } from '@tanstack/react-virtual';

// Workaround for https://github.com/TanStack/virtual/issues/634: the virtualizer can cache a
// stale/zero-sized scrollRect when the scroll container mounts, breaking item measurement.
// Patching it from the live element on every render fixes virtualization in Firefox and Chrome.
const useVirtualizerScrollRectWorkaround = <TScrollElement extends HTMLElement, TItemElement extends Element>(
  rowVirtualizer: Virtualizer<TScrollElement, TItemElement>,
  parentRef: RefObject<TScrollElement | null>,
) => {
  if (parentRef.current) {
    // oxlint-disable-next-line no-param-reassign -- mutating the virtualizer instance is the workaround itself
    rowVirtualizer.scrollRect = { height: parentRef.current.clientHeight, width: parentRef.current.clientWidth };
  }
};

export default useVirtualizerScrollRectWorkaround;
