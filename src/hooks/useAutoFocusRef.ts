import type React from 'react';

import useEventCallback from './useEventCallback';

function useAutoFocusRef(autoFocus: boolean, bodyVisible: boolean): React.MutableRefObject<HTMLInputElement | null> {
  // eslint-disable-next-line no-undef
  const ref: React.MutableRefObject<HTMLInputElement | null> & { timeout?: NodeJS.Timeout } = useEventCallback(
    (element: HTMLInputElement | null) => {
      ref.current = element;
      if (autoFocus && bodyVisible && element) {
        if (ref.timeout) clearTimeout(ref.timeout);
        ref.timeout = setTimeout(() => {
          if (ref.timeout) delete ref.timeout;
          element.focus();
        }, 0);
      }
    },
    // eslint-disable-next-line no-undef
  ) as unknown as React.MutableRefObject<HTMLInputElement> & { timeout?: NodeJS.Timeout };
  return ref;
}

export default useAutoFocusRef;
