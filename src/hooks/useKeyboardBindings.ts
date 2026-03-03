/* eslint-disable no-continue */
/* eslint-disable no-labels */
import { useEffect, useEffectEvent } from 'react';

export type KeyboardEventHandler = (event: KeyboardEvent) => void;

// Assume a keyboard is attached if we can detect a "fine" pointer (AKA a non-touch primary pointer).
export const keybindingsEnabled = window.matchMedia('(pointer: fine)').matches;

function useKeyboardBindings(
  enabled: boolean,
  ...eventHandlers: (
    | Iterable<[eventShape: Partial<KeyboardEvent> | string, eventHandler: KeyboardEventHandler]>
    | Record<string, KeyboardEventHandler>
  )[]
): void {
  const onKeyboard = useEffectEvent((event: KeyboardEvent) => {
    if (!enabled || !keybindingsEnabled) return;
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
    if (keybindingsEnabled && enabled) {
      window.addEventListener('keydown', onKeyboard);
    }
    return () => {
      window.removeEventListener('keydown', onKeyboard);
    };
  }, [enabled]);
}

export default useKeyboardBindings;
