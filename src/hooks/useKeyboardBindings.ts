/* eslint-disable no-continue */
/* eslint-disable no-labels */
import { useEffect, useEffectEvent } from 'react';

export type KeyboardEventHandler = (event: KeyboardEvent) => void;

function useKeyboardBindings(
  enabled: boolean,
  ...eventHandlers: (
    | Iterable<[eventShape: Partial<KeyboardEvent> | string, eventHandler: KeyboardEventHandler]>
    | Record<string, KeyboardEventHandler>
  )[]
): void {
  const onKeyboard = useEffectEvent((event: KeyboardEvent) => {
    if (!enabled) return;
    for (const eHr of eventHandlers) {
      const iterable = Symbol.iterator in eHr
        ? eHr
        : Object.entries(eHr);
      eventLoop: for (const [eventShape, eventHandler] of iterable) {
        if (typeof eventShape === 'string') {
          if (event.key !== eventShape || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
            continue;
          }
        } else {
          for (const key in eventShape) {
            if (event[key] !== eventShape[key]) {
              continue eventLoop;
            }
          }
        }
        event.stopPropagation();
        event.preventDefault();
        eventHandler(event);
        return;
      }
    }
  });

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', onKeyboard);
    }
    return () => {
      window.removeEventListener('keydown', onKeyboard);
    };
  }, [enabled]);
}

export default useKeyboardBindings;
