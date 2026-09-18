import { useEffect, useRef } from 'react';

type TimeoutType = ReturnType<typeof globalThis.setTimeout>;

/**
 * Returns a ref to attach to an `<input>`. When `autoFocus` is true, the input
 * is focused — either when `autoFocus` flips to true, or on the render where the
 * element is already mounted (e.g. a modal whose content renders asynchronously,
 * where plain `autoFocus` on the element wouldn't work).
 */
const useAutoFocusRef = (autoFocus: boolean) => {
  const elementRef = useRef<HTMLInputElement | null>(null);
  // Bookkeeping only — holds the id of the currently scheduled focus timer so
  // overlapping requests can cancel the stale one. Not UI state, hence a ref.
  const timeoutRef = useRef<TimeoutType | undefined>(undefined);

  // Runs when `autoFocus` changes, and once on mount if it starts true.
  useEffect(() => {
    // Nothing to do unless autofocus is wanted and the element already exists.
    if (!autoFocus || !elementRef.current) return;

    const element = elementRef.current;
    // Defer focus with setTimeout(0): the element needs to finish mounting and
    // become focusable before .focus() actually takes effect.
    const timeout = setTimeout(() => {
      // Bail if this timer was superseded by a newer focus request.
      if (timeoutRef.current !== timeout) return;
      timeoutRef.current = undefined;
      // Bail if the element was unmounted/replaced while we waited.
      if (elementRef.current === element) {
        element.focus();
      }
    }, 0);
    // Only one pending focus request at a time — cancel any previous timer.
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = timeout;
  }, [autoFocus]);

  return elementRef;
};

export default useAutoFocusRef;
