import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useOutletContext } from 'react-router';

import CreditsSearchAndFilterPanel from '@/components/Collection/Credits/CreditsSearchAndFilterPanel';
import StaffPanelVirtualizer from '@/components/Collection/Credits/CreditsStaffVirtualizer';
import MultiStateButton from '@/components/Input/MultiStateButton';
import SelectSmall from '@/components/Input/SelectSmall';
import { useAnilistAnimeCreditsQueries } from '@/core/react-query/anilist/queries';
import {
  useRefreshSeriesAniDBInfoMutation,
  useRefreshSeriesAnilistInfoMutation,
} from '@/core/react-query/series/mutations';
import { useSeriesCastQuery } from '@/core/react-query/series/queries';
import { useSupportedLanguagesQuery } from '@/core/react-query/settings/queries';

import type { SeriesContextType } from '@/components/Collection/constants';
import type { SeriesCast } from '@/core/types/api/series';

export type CreditsModeType = 'Character' | 'Staff';

export type CreditsSourceType = 'AniDB' | 'AniList';

const cleanString = (input = '') => input.replaceAll(' ', '').toLowerCase();

const getUniqueRoles = (castList: SeriesCast[]) => [...new Set(castList.map(cast => cast.RoleDetails))];

const getUniqueLanguages = (castList: SeriesCast[]) =>
  [...new Set(castList.map(cast => cast.Language).filter((language): language is string => !!language))]
    .sort((languageA, languageB) => languageA.localeCompare(languageB));

const allLanguages = 'all';

const modeStates: { label?: string, value: CreditsModeType }[] = [
  { label: 'Characters', value: 'Character' },
  { value: 'Staff' },
];

const sourceStates: { value: CreditsSourceType }[] = [
  { value: 'AniDB' },
  { value: 'AniList' },
];

const SeriesCredits = () => {
  const { series } = useOutletContext<SeriesContextType>();

  const { isPending: pendingRefreshAniDb, mutate: refreshAniDbMutation } = useRefreshSeriesAniDBInfoMutation(
    series.IDs.ID,
  );
  const { isPending: pendingRefreshAnilist, mutate: refreshAnilistMutation } = useRefreshSeriesAnilistInfoMutation(
    series.IDs.ID,
  );

  const [source, setSource] = useState<CreditsSourceType>(sourceStates[0].value);

  const refreshSource = () => {
    if (source === 'AniList') {
      refreshAnilistMutation();
      return;
    }
    refreshAniDbMutation({ force: true });
  };

  const [mode, setMode] = useState<CreditsModeType>(modeStates[0].value);

  const [search, setSearch] = useState('');

  const [roleFilter, setRoleFilter] = useState<Set<string>>(new Set());

  const [language, setLanguage] = useState(allLanguages);

  const handleModeChange = (newMode: CreditsModeType) => {
    setMode(() => {
      setSearch('');
      setRoleFilter(new Set());
      setLanguage(allLanguages);
      return newMode;
    });
  };

  const handleSourceChange = (newSource: CreditsSourceType) => {
    setSource(() => {
      setSearch('');
      setRoleFilter(new Set());
      setLanguage(allLanguages);
      return newSource;
    });
  };

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id: description } = event.target;
    setRoleFilter((prevState) => {
      const newState = new Set(prevState);
      if (!newState.delete(description)) newState.add(description);
      return newState;
    });
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };

  const languageNames = useSupportedLanguagesQuery().data;

  const anidbCast = useSeriesCastQuery(series.IDs.ID, source === 'AniDB').data;
  const anilistCredits = useAnilistAnimeCreditsQueries(series.IDs.AniList, source === 'AniList').data;
  const cast = source === 'AniList' ? anilistCredits : anidbCast;
  const castByType = useMemo(() => ({
    Character: cast?.filter(credit => credit.RoleName === 'Actor') ?? [],
    Staff: cast?.filter(credit => credit.RoleName !== 'Actor') ?? [],
  }), [cast]);

  const uniqueRoles = useMemo(() => ({
    Character: getUniqueRoles(castByType.Character),
    Staff: getUniqueRoles(castByType.Staff),
  }), [castByType]);

  const languages = useMemo(() => getUniqueLanguages(castByType[mode]), [castByType, mode]);
  // Only worth showing when there is actually something to choose between, eg. multiple dubs.
  const showLanguageFilter = languages.length > 1;

  const filteredCast = useMemo(() => (castByType[mode].filter(item => (
    (search === ''
      || ([item?.Character?.Name, item?.Staff?.Name].some(name => cleanString(name).includes(cleanString(search)))))
    && !roleFilter.has(item?.RoleDetails)
    && (language === allLanguages || item.Language === language)
  )).sort((castA, castB) => {
    const nameA = castA[mode]?.Name ?? '';
    const nameB = castB[mode]?.Name ?? '';
    if (nameA > nameB) return 1;
    if (nameA < nameB) return -1;
    return 0;
  })), [castByType, language, mode, search, roleFilter]);

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
            refreshAniDbAction={refreshSource}
            aniDbRefreshing={source === 'AniList' ? pendingRefreshAnilist : pendingRefreshAniDb}
          />
        </div>

        <div className="flex w-full grow flex-col gap-x-6 gap-y-4">
          <div className="flex h-24.5 items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent px-6 py-4">
            <div className="text-xl font-semibold">
              Credits |&nbsp;
              {(search !== '' || roleFilter.size > 0 || language !== allLanguages) && (
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
            <div className="flex items-center gap-x-6">
              {showLanguageFilter && (
                <SelectSmall
                  id="credits-language"
                  label="Language"
                  className="gap-x-3"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  <option value={allLanguages}>All</option>
                  {languages.map(code => (
                    <option key={code} value={code}>
                      {languageNames?.[code] ?? code.toUpperCase()}
                    </option>
                  ))}
                </SelectSmall>
              )}
              <MultiStateButton activeState={source} states={sourceStates} onStateChange={handleSourceChange} />
              <MultiStateButton activeState={mode} states={modeStates} onStateChange={handleModeChange} />
            </div>
          </div>
          <StaffPanelVirtualizer castArray={filteredCast} mode={mode} />
        </div>
      </div>
    </>
  );
};

export default SeriesCredits;
