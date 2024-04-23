import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { mdiInformationOutline, mdiMagnify, mdiPlayCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import { get, map, toNumber } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import CharacterImage from '@/components/CharacterImage';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import {
  useRefreshSeriesAniDBInfoMutation,
  useRefreshSeriesTvdbInfoMutatation,
} from '@/core/react-query/series/mutations';
import { useSeriesCastQuery } from '@/core/react-query/series/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { ImageType } from '@/core/types/api/common';
import type { SeriesCast } from '@/core/types/api/series';

type ModeType = 'Character' | 'Staff';

const getThumbnailUrl = (item: SeriesCast, mode: ModeType) => {
  const thumbnail = get<SeriesCast, string, ImageType | null>(item, `${mode}.Image`, null);
  if (thumbnail === null) return null;
  return `/api/v3/Image/${thumbnail.Source}/${thumbnail.Type}/${thumbnail.ID}`;
};

const creditTypeVariations = {
  Character: 'Characters',
  Staff: 'Staff',
};

const CreditsStaffPanel = React.memo(({ cast, mode }: { cast: SeriesCast, mode: ModeType }) => (
  <div className="flex w-[29.5rem] flex-row items-center gap-6 rounded-lg border border-panel-border bg-panel-background-transparent p-6 font-semibold">
    <div className="z-10 flex gap-x-2">
      {mode === 'Character' && (
        <CharacterImage
          imageSrc={getThumbnailUrl(cast, 'Character')}
          className="relative h-[7.75rem] w-[6.063rem] rounded-lg"
        />
      )}
      <CharacterImage
        imageSrc={getThumbnailUrl(cast, 'Staff')}
        className="relative h-[7.75rem] w-[6.063rem] rounded-lg"
      />
    </div>
    <div className="grow text-center">
      <div className="line-clamp-2 text-base leading-8 xl:text-xl" title={cast[mode]?.Name}>
        {cast[mode]?.Name}
      </div>
      {mode === 'Character' && <div className="opacity-65">{cast.Staff?.Name}</div>}
      <div className="mt-2 text-sm">{cast.RoleDetails}</div>
    </div>
  </div>
));

const Heading = React.memo(({ mode, setMode }: { mode: ModeType, setMode: (mode: ModeType) => void }) => (
  <div className="flex items-center gap-x-2 text-xl font-semibold">
    <div className="flex gap-x-1">
      {map(creditTypeVariations, (value, key: ModeType) => (
        <Button
          className={cx(
            'w-[7.5rem] rounded-lg mr-2 py-3 px-4 !font-normal !text-base',
            mode !== key
              ? 'bg-panel-background text-panel-toggle-text-alt hover:bg-panel-toggle-background-hover'
              : '!bg-panel-toggle-background text-panel-toggle-text',
          )}
          key={key}
          onClick={() => setMode(key)}
        >
          {value}
        </Button>
      ))}
    </div>
  </div>
));

const isCharacter = (item: SeriesCast) => item.RoleName === 'Seiyuu';

const cleanString = (input = '') => input.replaceAll(' ', '').toLowerCase();

const getUniqueDescriptions = (castList: SeriesCast[]) => [...new Set(castList.map(c => c.RoleDetails))];

const SeriesCredits = () => {
  const { seriesId } = useParams();

  const { isPending: pendingRefreshAniDb, mutate: refreshAniDb } = useRefreshSeriesAniDBInfoMutation();
  const { isPending: pendingRefreshTvDb, mutate: refreshTvDb } = useRefreshSeriesTvdbInfoMutatation();

  const [mode, setMode] = useState<ModeType>('Character');
  const [search, setSearch] = useState('');

  const [debouncedSearch] = useDebounceValue(() => cleanString(search), 200);

  const cast = useSeriesCastQuery(toNumber(seriesId!), !!seriesId).data;
  const castByType = useMemo(() => ({
    Character: cast?.filter(credit => isCharacter(credit)) ?? [],
    Staff: cast?.filter(credit => !isCharacter(credit)) ?? [],
  }), [cast]);

  const uniqueDescriptions = useMemo(() => ({
    Character: getUniqueDescriptions(castByType.Character),
    Staff: getUniqueDescriptions(castByType.Staff),
  }), [castByType]);

  const [descriptionFilter, setDescriptionFilter] = useState<string[]>([]);

  const filteredCast = useMemo(() => (castByType[mode].filter(p => (
    (debouncedSearch === ''
      || !!(cleanString(p?.Character?.Name).match(debouncedSearch))
      || !!(cleanString(p?.Staff?.Name).match(debouncedSearch)))
    && !descriptionFilter.includes(p?.RoleDetails)
  )).sort((a, b) => {
    if (a[mode].Name > b[mode].Name) return 1;
    if (a[mode].Name < b[mode].Name) return -1;
    return 0;
  })), [castByType, mode, debouncedSearch, descriptionFilter]);

  useEffect(() => {
    setSearch('');
    setDescriptionFilter([]);
  }, [mode]);

  const handleFilterChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked: active, id: description } = event.target;
    if (active && descriptionFilter.includes(description)) {
      setDescriptionFilter(descriptionFilter.filter(d => d !== description));
    }
    if (!active && !descriptionFilter.includes(description)) {
      setDescriptionFilter([...descriptionFilter, description]);
    }
  });

  if (!seriesId) return null;

  return (
    <div className="flex w-full gap-x-6">
      <div className="flex w-400 shrink-0 flex-col gap-y-6">
        <ShokoPanel
          title="Search & Filter"
          className="flex w-full flex-col"
          contentClassName="flex !flex-col gap-y-6 2xl:gap-x-6 h-full"
          fullHeight={false}
          transparent
        >
          <div className="flex flex-col gap-y-6">
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
                {map(uniqueDescriptions[mode], desc => (
                  <Checkbox
                    justify
                    label={desc}
                    key={desc}
                    id={desc}
                    isChecked={!descriptionFilter.includes(desc)}
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
          </div>
        </ShokoPanel>
      </div>
      <div className="flex w-full grow gap-6">
        <div className="flex grow flex-col gap-y-4">
          <div className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent px-6 py-4">
            <div className="text-xl font-semibold">
              Credits |&nbsp;
              {(debouncedSearch !== '' || descriptionFilter.length !== 0) && (
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
              {creditTypeVariations[mode]}
              &nbsp;Listed
            </div>
            <Heading mode={mode} setMode={setMode} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {map(
              filteredCast,
              (item, idx) => <CreditsStaffPanel cast={item} mode={mode} key={`${mode}-${idx}`} />,
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesCredits;
