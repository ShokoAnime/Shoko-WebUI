import { useLayoutEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { get, isEqual } from 'lodash';

import { pathToString } from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';

import type { SectionType } from '@/components/Configuration/hooks/useSections';

export type TabType = {
  name: string;
  onClick: () => void;
  current: boolean;
};

function useTabs(sections: SectionType[], path: (string | number)[]): [SectionType | undefined, TabType[]] {
  const currentPath = useMemo(() => (pathToString(['tab', ...path])), [path]);

  const [navigationState, updateNavigationState] = useSearchParams();

  const currentTab = useMemo(() => {
    const value = parseInt(navigationState.get(currentPath) ?? '0', 10);
    if (Number.isNaN(value)) return 0;
    return value;
  }, [navigationState, currentPath]);

  const currentSection = useMemo(() => sections[currentTab], [sections, currentTab]);

  const setCurrentTab = useEventCallback((value: number, replace = false) => {
    const changedState = Object.fromEntries(navigationState.entries());
    const keys = Object.keys(changedState)
      .filter(key => key.startsWith(`${currentPath}.`));
    for (const key of keys) {
      delete changedState[key];
    }
    if (value === 0) {
      delete changedState[currentPath];
    } else {
      changedState[currentPath] = value.toString();
    }
    updateNavigationState(changedState, { replace });
  });

  const tabDetails = useMemo(() => {
    const tabs = new Array<TabType>();
    for (const [index, { config, hideByDefault, title, toggle }] of sections.entries()) {
      if (toggle) {
        const value = get(config, toggle.path.split('.')) as unknown;
        const isToggled = isEqual(value, toggle.value);
        if (hideByDefault !== isToggled) {
          continue;
        }
      } else if (hideByDefault) {
        continue;
      }
      tabs.push({
        name: title,
        onClick: () => {
          setCurrentTab(index);
        },
        current: currentTab === index,
      });
    }

    return tabs;
  }, [sections, currentTab, setCurrentTab]);

  useLayoutEffect(() => {
    if (!tabDetails.find(tab => tab.current) && tabDetails.length > 0) setCurrentTab(0);
  }, [tabDetails, currentTab, setCurrentTab]);

  return [currentSection, tabDetails];
}

export default useTabs;
