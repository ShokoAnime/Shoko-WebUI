import { useLayoutEffect, useMemo, useRef } from 'react';

// Taken from https://github.com/Volune/use-event-callback
// Discussion: https://github.com/facebook/react/issues/14099

// Typed same as useCallback

// eslint-disable-next-line @typescript-eslint/ban-types
const useEventCallback = <T extends Function>(fn: T): T => {
  const ref = useRef<T>(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  });
  // @ts-expect-error if you can figure out how to type it, go ahead
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMemo<T>(() => (...args: any[]) => {
    const { current } = ref;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-argument
    return current(...args);
  }, []);
};

export default useEventCallback;
