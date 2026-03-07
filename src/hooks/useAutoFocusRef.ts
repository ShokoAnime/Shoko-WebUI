import type React from 'react';
import { useEffect, useMemo, useRef } from 'react';

type TimeoutType = ReturnType<typeof globalThis.setTimeout>;

function useAutoFocusRef(autoFocus: boolean): React.RefObject<HTMLInputElement | null> {
  const elementRef = useRef<HTMLInputElement | null>(null) as React.RefObject<HTMLInputElement | null> & {
    timeout?: TimeoutType;
  };
  const autoFocusRef = useRef(autoFocus);

  // Focus the element when auto-focus changes.
  useEffect(() => {
    autoFocusRef.current = autoFocus;
    if (autoFocus && elementRef.current) {
      const element = elementRef.current;
      const timeout = setTimeout(() => {
        if (elementRef.timeout !== timeout) return;
        delete elementRef.timeout;
        if (elementRef.current === element) {
          element.focus();
        }
      }, 0);
      if (elementRef.timeout) clearTimeout(elementRef.timeout);
      elementRef.timeout = timeout;
    }
  }, [autoFocus]);

  // Focus the element when the ref is set.
  return useMemo(() =>
    new Proxy(elementRef, {
      apply(_, __, argArray: [element: HTMLInputElement | null]) {
        const [element] = argArray;
        elementRef.current = element;
        if (autoFocusRef.current && element) {
          const timeout = setTimeout(() => {
            if (elementRef.timeout !== timeout) return;
            delete elementRef.timeout;
            if (elementRef.current === element) {
              element.focus();
            }
          }, 0);
          if (elementRef.timeout) clearTimeout(elementRef.timeout);
          elementRef.timeout = timeout;
        }
      },
    }), []) as unknown as React.RefObject<HTMLInputElement | null>;
}

export default useAutoFocusRef;
