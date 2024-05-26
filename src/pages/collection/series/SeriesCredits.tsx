import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { mdiInformationOutline, mdiMagnify, mdiPlayCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { map, toNumber } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import StaffPanelVirtualizer from '@/components/Collection/Credits/CreditsStaffVirtualizer';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import MultiStateButton from '@/components/Input/MultiStateButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import {
  useRefreshSeriesAniDBInfoMutation,
  useRefreshSeriesTvdbInfoMutatation,
} from '@/core/react-query/series/mutations';
import { useSeriesCastQuery } from '@/core/react-query/series/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { SeriesCast } from '@/core/types/api/series';

export type CreditsModeType = 'Character' | 'Staff';

const cleanString = (input = '') => input.replaceAll(' ', '').toLowerCase();

const getUniqueRoles = (castList: SeriesCast[]) => [...new Set(castList.map(c => c.RoleDetails))];

const modeStates: { label?: string, value: CreditsModeType }[] = [
  { label: 'Characters', value: 'Character' },
  { value: 'Staff' },
];

const SeriesCredits = () => {
  const { seriesId } = useParams();

  const { isPending: pendingRefreshAniDb, mutate: refreshAniDb } = useRefreshSeriesAniDBInfoMutation();
  const { isPending: pendingRefreshTvDb, mutate: refreshTvDb } = useRefreshSeriesTvdbInfoMutatation();

  const [mode, setMode] = useState<CreditsModeType>(modeStates[0].value);

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(() => cleanString(search), 200);

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

  const cast = useSeriesCastQuery(toNumber(seriesId!), !!seriesId).data;
  const castByType = useMemo(() => ({
    Character: cast?.filter(credit => credit.RoleName === 'Seiyuu') ?? [],
    Staff: cast?.filter(credit => credit.RoleName !== 'Seiyuu') ?? [],
  }), [cast]);

  const uniqueRoles = useMemo(() => ({
    Character: getUniqueRoles(castByType.Character),
    Staff: getUniqueRoles(castByType.Staff),
  }), [castByType]);

  const filteredCast = useMemo(() => (castByType[mode].filter(p => (
    (debouncedSearch === ''
      || !!([p?.Character?.Name, p?.Staff?.Name].some(name => cleanString(name).match(debouncedSearch))))
    && !roleFilter.has(p?.RoleDetails)
  )).sort((a, b) => {
    if (a[mode].Name > b[mode].Name) return 1;
    if (a[mode].Name < b[mode].Name) return -1;
    return 0;
  })), [castByType, mode, debouncedSearch, roleFilter]);

  if (!seriesId) return null;

  return (
    <div className="flex w-full gap-x-6">
      <div className="flex flex-col gap-y-6">
        <ShokoPanel
          title="Search & Filter"
          className="w-400"
          contentClassName="gap-y-6"
          sticky
          transparent
          fullHeight={false}
        >
          <div className="flex flex-col gap-y-2">
            <span className="flex w-full text-base font-semibold">
              Name
            </span>
            <Input
              id="search"
              startIcon={mdiMagnify}
              type="text"
              placeholder={mode === 'Character' ? 'Character or Seiyuu\'s Name...' : 'Staff Name...'}
              value={search}
              inputClassName="px-4 py-3"
              onChange={event => setSearch(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <div className="text-base font-semibold">Roles</div>
            <div className="flex flex-col gap-y-2 rounded-lg bg-panel-input p-6">
              {map(uniqueRoles[mode], desc => (
                <Checkbox
                  justify
                  label={desc}
                  key={desc}
                  id={desc}
                  isChecked={!roleFilter.has(desc)}
                  onChange={handleFilterChange}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-y-2">
            <div className="text-base font-semibold">Quick Actions</div>
            <button
              type="button"
              className="flex w-full flex-row justify-between disabled:cursor-not-allowed disabled:opacity-65"
              onClick={() =>
                refreshAniDb({ seriesId: toNumber(seriesId), force: true }, {
                  onSuccess: () => toast.success('AniDB refresh queued!'),
                })}
              disabled={pendingRefreshAniDb}
            >
              Force refresh: AniDB
              <Icon
                path={mdiPlayCircleOutline}
                className="pointer-events-auto text-panel-icon-action group-disabled:cursor-not-allowed"
                size={1}
              />
            </button>
            <button
              type="button"
              className="flex w-full flex-row justify-between disabled:cursor-not-allowed disabled:opacity-65"
              onClick={() =>
                refreshTvDb({ seriesId: toNumber(seriesId), force: true }, {
                  onSuccess: () => toast.success('TvDB refresh queued!'),
                })}
              disabled={pendingRefreshTvDb}
            >
              Force refresh: TVDB
              <Icon
                path={mdiPlayCircleOutline}
                className="pointer-events-auto text-panel-icon-action group-disabled:cursor-not-allowed"
                size={1}
              />
            </button>
          </div>
          <hr className="border border-panel-border" />
          <div className="flex flex-row gap-x-3">
            <Icon path={mdiInformationOutline} className="text-panel-icon-warning" size={1} />
            <div className="grow text-base font-semibold">
              Warning! Possible Spoilers
            </div>
          </div>
        </ShokoPanel>
      </div>

      <div className="flex w-full grow flex-col gap-x-6 gap-y-4">
        <div className="flex h-[6.125rem] items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent px-6 py-4">
          <div className="text-xl font-semibold">
            Credits |&nbsp;
            {(debouncedSearch !== '' || roleFilter.size > 0) && (
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
  );
};

export default SeriesCredits;
