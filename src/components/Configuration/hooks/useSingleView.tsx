import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { pathToString } from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';

import type { SectionType } from '@/components/Configuration/hooks/useSections';

function useSingleView(
  sections: SectionType[],
  path: (string | number)[],
): [
  section: SectionType | null | undefined,
  index: number | null | undefined,
  setCurrentView: (value: number | null | undefined, replace?: boolean) => void,
] {
  const currentPath = useMemo(() => (pathToString(['view', ...path])), [path]);

  const [navigationState, updateNavigationState] = useSearchParams();

  const currentIndex = useMemo(() => {
    const navVal = navigationState.get(currentPath) ?? '';
    if (navVal === '') return undefined;
    if (navVal === 'new') return null;
    const value = parseInt(navVal, 10);
    if (Number.isNaN(value)) return undefined;
    return value;
  }, [navigationState, currentPath]);

  const currentSection = useMemo(() => (currentIndex == null ? currentIndex : sections[currentIndex] ?? null), [
    sections,
    currentIndex,
  ]);

  const setCurrentView = useEventCallback((value: number | null | undefined, replace = false) => {
    updateNavigationState((prevState) => {
      const changedState = Object.fromEntries(prevState.entries());
      const keys = Object.keys(changedState)
        .filter(key => key.startsWith(`${currentPath}.`));
      for (const key of keys) {
        delete changedState[key];
      }
      if (value === null) {
        changedState[currentPath] = 'new';
      } else if (
        value === undefined
        || (Number.isNaN(value) || !Number.isInteger(value) || value < 0 || value >= sections.length)
      ) {
        delete changedState[currentPath];
      } else {
        changedState[currentPath] = value.toString();
      }
      return changedState;
    }, { replace });
  });

  return [currentSection, currentIndex, setCurrentView];
}

export default useSingleView;
