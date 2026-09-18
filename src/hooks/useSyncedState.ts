import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

/**
 * State that re-initializes from a source value whenever the source changes (by reference),
 * while preserving in-progress edits between source changes.
 *
 * Implemented with the render-time adjustment pattern (react.dev "You Might Not Need an
 * Effect" → "Adjusting some state when a prop changes"): the reset runs during render, so
 * the component never paints a stale value and no effect is needed. React discards the
 * triggering render and retries immediately with the fresh value returned below.
 *
 * Source changes are detected with `Object.is` (reference equality) — pass values that
 * change identity when their relevant content changes, e.g. React Query data objects.
 */
const useSyncedState = <TSource, TValue = TSource>(
  source: TSource,
  getResetValue?: (source: TSource, prev?: TValue) => TValue,
) => {
  const resetValue = (
    currentSource: TSource,
    prev?: TValue,
  ): TValue => (getResetValue ? getResetValue(currentSource, prev) : (currentSource as unknown as TValue));

  const [value, setValue] = useState<TValue>(() => resetValue(source));
  const [prevSource, setPrevSource] = useState(source);

  let currentValue = value;
  if (!Object.is(prevSource, source)) {
    const nextValue = resetValue(source, value);
    currentValue = nextValue;
    setPrevSource(source);
    setValue(nextValue);
  }

  return [currentValue, setValue] as const satisfies [TValue, Dispatch<SetStateAction<TValue>>];
};

export default useSyncedState;
