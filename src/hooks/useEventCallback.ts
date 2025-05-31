import { useLayoutEffect, useMemo, useRef } from 'react';

// Taken from https://github.com/Volune/use-event-callback
// Discussion: https://github.com/facebook/react/issues/14099

// Typed same as useCallback

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const useEventCallback = <T extends Function>(func: T): T => {
  const ref = useRef<T>(func);
  useLayoutEffect(() => {
    ref.current = func;
  });
  // @ts-expect-error if you can figure out how to type it, go ahead
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMemo<T>(() => (...args: any[]) => {
    const { current } = ref;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-call
    return current(...args);
  }, []);
};

export default useEventCallback;
