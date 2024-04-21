import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { mdiInformationOutline, mdiMagnify, mdiPlayCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import { get, map, toNumber } from 'lodash';

import CharacterImage from '@/components/CharacterImage';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useSeriesCastQuery } from '@/core/react-query/series/queries';

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

const getUniqueDescriptions = (castList: SeriesCast[]) => [...new Set(castList.map(c => c.RoleDetails))];

const SeriesCredits = () => {
  const { seriesId } = useParams();

  const [mode, setMode] = useState<ModeType>('Character');
  const [search, setSearch] = useState('');

  const cast = useSeriesCastQuery(toNumber(seriesId!), !!seriesId).data;
  const castByType = useMemo(() => ({
    Character: cast?.filter(credit => isCharacter(credit)) ?? [],
    Staff: cast?.filter(credit => !isCharacter(credit)) ?? [],
  }), [cast]);

  const uniqueDescriptions = useMemo(() => ({
    Character: getUniqueDescriptions(castByType.Character),
    Staff: getUniqueDescriptions(castByType.Staff),
  }), [castByType]);

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
                {mode}
                &nbsp;Search
              </span>
              <Input
                id="search"
                startIcon={mdiMagnify}
                type="text"
                placeholder="Search..."
                value={search}
                inputClassName="px-4 py-3"
                onChange={event => setSearch(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <div className="text-base font-semibold">Roles</div>
              <div className="flex flex-col gap-y-2 rounded-lg bg-panel-input p-6">
                {map(uniqueDescriptions[mode], desc => (
                  <div className="flex flex-row justify-between" key={desc}>
                    <div className="text-base">{desc}</div>
                    <Checkbox
                      id={desc}
                      key={desc}
                      isChecked
                      onChange={() => {}}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-y-2">
              <div className="text-base font-semibold">Quick Actions</div>
              <div className="flex flex-row justify-between">
                <div>Change Sort | A-Z</div>
                <button type="button" aria-label="Start action">
                  <Icon path={mdiPlayCircleOutline} className="pointer-events-auto text-panel-icon-action" size={1} />
                </button>
              </div>
              <div className="flex flex-row justify-between">
                <div>Download Missing Data</div>
                <button type="button" aria-label="Start action">
                  <Icon path={mdiPlayCircleOutline} className="pointer-events-auto text-panel-icon-action" size={1} />
                </button>
              </div>
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
      <div className="flex grow gap-6">
        <div className="flex flex-col gap-y-4">
          <div className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent px-6 py-4">
            <div className="text-xl font-semibold">
              Credits |&nbsp;
              <span className="text-panel-text-important">
                {castByType[mode]?.length ?? 0}
              </span>
              &nbsp;
              {creditTypeVariations[mode]}
              &nbsp;Listed
            </div>
            <Heading mode={mode} setMode={setMode} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {map(
              castByType[mode],
              (item, idx) => (
                <div
                  key={`${mode}-${idx}`}
                  className="flex w-[29.5rem] flex-row items-center gap-6 rounded-lg border border-panel-border bg-panel-background-transparent p-6 font-semibold"
                >
                  <div className="z-10 flex gap-x-2">
                    {mode === 'Character' && (
                      <CharacterImage
                        imageSrc={getThumbnailUrl(item, 'Character')}
                        className="relative h-[7.75rem] w-[6.063rem] rounded-lg"
                      />
                    )}
                    <CharacterImage
                      imageSrc={getThumbnailUrl(item, 'Staff')}
                      className="relative h-[7.75rem] w-[6.063rem] rounded-lg"
                    />
                  </div>
                  <div className="grow text-center">
                    <div className="line-clamp-2 text-base leading-8 xl:text-xl">
                      {item[mode]?.Name}
                    </div>
                    {mode === 'Character' && <div className="opacity-65">{item.Staff?.Name}</div>}
                    <div className="mt-2 text-sm">{item.RoleDetails}</div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesCredits;
