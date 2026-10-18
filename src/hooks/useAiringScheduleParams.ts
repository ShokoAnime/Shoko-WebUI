import { useSearchParams } from 'react-router';
import type { NavigateOptions } from 'react-router';

import { dayjs } from '@/core/util';
import { AIRING_KINDS, CALENDAR_VIEWS, DAY_KEY_FORMAT } from '@/core/utilities/airingSchedule';
import { parseSeasonKey } from '@/core/utilities/season';

const views = ['season', ...CALENDAR_VIEWS] as const;

const useAiringScheduleParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get('date');

  const setParams = (changes: Record<string, string | null>, options?: NavigateOptions) =>
    setSearchParams((current) => {
      const params = new URLSearchParams(current);
      for (const [key, value] of Object.entries(changes)) {
        if (value === null) params.delete(key);
        else params.set(key, value);
      }
      return params;
    }, options);

  return {
    isBrowsing: searchParams.get('browse') === 'true',
    date: dateParam && dayjs(dateParam, DAY_KEY_FORMAT, true).isValid() ? dayjs(dateParam, DAY_KEY_FORMAT) : null,
    hideEstimates: searchParams.get('hideEstimates') === 'true',
    kind: AIRING_KINDS.find(kind => kind === searchParams.get('kind')) ?? 'All',
    provider: searchParams.get('provider') ?? '',
    scope: searchParams.get('scope') === 'all' ? 'all' : 'collection',
    season: parseSeasonKey(searchParams.get('season')),
    setParams,
    showReruns: searchParams.get('showReruns') === 'true',
    view: views.find(view => view === searchParams.get('view')) ?? 'season',
  } as const;
};

export default useAiringScheduleParams;
