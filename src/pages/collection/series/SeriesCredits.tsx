import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router';

import CreditsSearchAndFilterPanel from '@/components/Collection/Credits/CreditsSearchAndFilterPanel';
import StaffPanelVirtualizer from '@/components/Collection/Credits/CreditsStaffVirtualizer';
import MultiStateButton from '@/components/Input/MultiStateButton';
import { useRefreshSeriesAniDBInfoMutation } from '@/core/react-query/series/mutations';
import { useSeriesCastQuery } from '@/core/react-query/series/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { SeriesContextType } from '@/components/Collection/constants';
import type { SeriesCast } from '@/core/types/api/series';

export type CreditsModeType = 'Character' | 'Staff';

const cleanString = (input = '') => input.replaceAll(' ', '').toLowerCase();

const getUniqueRoles = (castList: SeriesCast[]) => [...new Set(castList.map(cast => cast.RoleDetails))];

const modeStates: { label?: string, value: CreditsModeType }[] = [
  { label: 'Characters', value: 'Character' },
  { value: 'Staff' },
];

const SeriesCredits = () => {
  const { series } = useOutletContext<SeriesContextType>();

  const { isPending: pendingRefreshAniDb, mutate: refreshAniDbMutation } = useRefreshSeriesAniDBInfoMutation(
    series.IDs.ID,
  );

  const refreshAniDb = useEventCallback(() => {
    refreshAniDbMutation({ force: true });
  });

  const [mode, setMode] = useState<CreditsModeType>(modeStates[0].value);

  const [search, setSearch] = useState('');

  const [roleFilter, setRoleFilter] = useState<Set<string>>(new Set());

  const handleModeChange = useEventCallback((newMode: CreditsModeType) => {
    setMode(() => {
      setSearch('');
      setRoleFilter(new Set());
      return newMode;
    });
  });

  const handleFilterChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { id: description } = event.target;
    setRoleFilter((prevState) => {
      const newState = new Set(prevState);
      if (!newState.delete(description)) newState.add(description);
      return newState;
    });
  });

  const handleSearchChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  });

  const cast = useSeriesCastQuery(series.IDs.ID).data;
  const castByType = useMemo(() => ({
    Character: cast?.filter(credit => credit.RoleName === 'Actor') ?? [],
    Staff: cast?.filter(credit => credit.RoleName !== 'Actor') ?? [],
  }), [cast]);

  const uniqueRoles = useMemo(() => ({
    Character: getUniqueRoles(castByType.Character),
    Staff: getUniqueRoles(castByType.Staff),
  }), [castByType]);

  const filteredCast = useMemo(() => (castByType[mode].filter(item => (
    (search === ''
      || !!([item?.Character?.Name, item?.Staff?.Name].some(name => cleanString(name).match(cleanString(search)))))
    && !roleFilter.has(item?.RoleDetails)
  )).sort((castA, castB) => {
    const nameA = castA[mode]?.Name ?? '';
    const nameB = castB[mode]?.Name ?? '';
    if (nameA > nameB) return 1;
    if (nameA < nameB) return -1;
    return 0;
  })), [castByType, mode, search, roleFilter]);

  return (
    <>
      <title>{`${series.Name} > Credits | Shoko`}</title>
      <div className="flex w-full gap-x-6">
        <div className="flex flex-col gap-y-6">
          <CreditsSearchAndFilterPanel
            inputPlaceholder={mode === 'Character' ? 'Character or Actor\'s Name...' : 'Staff Name...'}
            search={search}
            roleFilter={roleFilter}
            uniqueRoles={uniqueRoles[mode]}
            handleSearchChange={handleSearchChange}
            handleFilterChange={handleFilterChange}
            refreshAniDbAction={refreshAniDb}
            aniDbRefreshing={pendingRefreshAniDb}
          />
        </div>

        <div className="flex w-full grow flex-col gap-x-6 gap-y-4">
          <div className="flex h-[6.125rem] items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent px-6 py-4">
            <div className="text-xl font-semibold">
              Credits |&nbsp;
              {(search !== '' || roleFilter.size > 0) && (
                <>
                  <span className="text-panel-text-important">
                    {filteredCast.length}
                  </span>
                  &nbsp;of&nbsp;
                </>
              )}
              <span className="text-panel-text-important">
                {castByType[mode].length ?? 0}
              </span>
              &nbsp;
              {mode === 'Character' ? 'Characters' : mode}
              &nbsp;Listed
            </div>
            <MultiStateButton activeState={mode} states={modeStates} onStateChange={handleModeChange} />
          </div>
          <StaffPanelVirtualizer castArray={filteredCast} mode={mode} />
        </div>
      </div>
    </>
  );
};

export default SeriesCredits;
