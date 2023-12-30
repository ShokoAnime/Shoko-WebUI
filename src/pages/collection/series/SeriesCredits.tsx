import React, { useState } from 'react';
import { useParams } from 'react-router';
import { mdiChevronRight, mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { filter, get, map, toNumber } from 'lodash';

import CharacterImage from '@/components/CharacterImage';
import Input from '@/components/Input/Input';
import { useSeriesCastQuery } from '@/core/react-query/series/queries';

import type { ImageType } from '@/core/types/api/common';
import type { SeriesCast } from '@/core/types/api/series';

const getThumbnailUrl = (item: SeriesCast, mode: string) => {
  const thumbnail = get<SeriesCast, string, ImageType | null>(item, `${mode}.Image`, null);
  if (thumbnail === null) return null;
  return `/api/v3/Image/${thumbnail.Source}/${thumbnail.Type}/${thumbnail.ID}`;
};

const Heading = React.memo(({ mode, setMode }: { mode: string, setMode: (mode: string) => void }) => (
  <div className="flex items-center gap-x-2 text-xl font-semibold">
    Credits
    <Icon path={mdiChevronRight} size={1} />
    <div className="flex gap-x-1">
      <span
        onClick={() => {
          setMode('Character');
        }}
        className={cx(mode === 'Character' && 'text-panel-text-primary', 'cursor-pointer')}
      >
        Characters
      </span>
      |
      <span
        onClick={() => {
          setMode('Staff');
        }}
        className={cx(mode === 'Staff' && 'text-panel-text-primary', 'cursor-pointer')}
      >
        Staff
      </span>
    </div>
  </div>
));

const isCharacter = (item: SeriesCast) => item.RoleName === 'Seiyuu';

const SeriesCredits = () => {
  const { seriesId } = useParams();

  const [mode, setMode] = useState('Character');
  const [search, setSearch] = useState('');

  const cast = useSeriesCastQuery(toNumber(seriesId!), !!seriesId).data;

  if (!seriesId) return null;

  return (
    <>
      <div className="flex items-center gap-y-8 rounded-md border border-panel-border bg-panel-background-transparent p-8">
        <div className="flex w-full text-xl font-semibold">Character Search</div>
        <Input
          id="search"
          startIcon={mdiMagnify}
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
        />
      </div>
      <div className="flex gap-x-8">
        <div className="flex grow flex-col gap-y-4">
          <div className="flex items-center justify-between rounded-md border border-panel-border bg-panel-background-transparent px-8 py-4">
            <Heading mode={mode} setMode={setMode} />
            <div className="text-xl font-semibold">
              <span className="text-panel-text-important">{cast?.length || 0}</span>
              &nbsp;Characters Listed
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {map(
              filter(cast, value => (mode === 'Character' ? isCharacter(value) : !isCharacter(value))),
              (item, idx) => (
                <div
                  key={`${mode}-${idx}`}
                  className="flex flex-col items-center justify-center gap-y-4 rounded-md border border-panel-border bg-panel-background-transparent p-8 font-semibold"
                >
                  <div className="z-10 flex gap-x-2">
                    {mode === 'Character' && (
                      <CharacterImage
                        imageSrc={getThumbnailUrl(item, 'Character')}
                        className="relative h-[11rem] w-[8rem] rounded-md"
                      />
                    )}
                    <CharacterImage
                      imageSrc={getThumbnailUrl(item, 'Staff')}
                      className="relative h-[11rem] w-[8rem] rounded-md"
                    />
                  </div>
                  <div className="text-xl">{item.Character?.Name}</div>
                  <div className="-mt-2 opacity-65">{item.Staff?.Name}</div>
                  <div>{item.RoleDetails}</div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SeriesCredits;
