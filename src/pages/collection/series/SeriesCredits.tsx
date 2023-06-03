import React, { useState } from 'react';
import { useParams } from 'react-router';
import { filter, get, map } from 'lodash';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import { mdiChevronRight, mdiMagnify } from '@mdi/js';

import { useGetSeriesCastQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import CharacterImage from '@/components/CharacterImage';
import { ImageType } from '@/core/types/api/common';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { SeriesCast } from '@/core/types/api/series';
import Input from '@/components/Input/Input';

const getThumbnailUrl = (item: SeriesCast, mode: string) => {
  const thumbnail = get<SeriesCast, string, ImageType | null>(item, `${mode}.Image`, null);
  if (thumbnail === null) { return null; }
  return `/api/v3/Image/${thumbnail.Source}/${thumbnail.Type}/${thumbnail.ID}`;
};

const Heading = React.memo(({ mode, setMode }:{ mode: string; setMode: Function; }) => (
  <div className="flex gap-x-2 font-semibold text-xl items-center">
    Credits
    <Icon path={mdiChevronRight} size={1} />
    <div className="flex gap-x-1">
      <span onClick={() => { setMode('Character'); }} className={cx(mode === 'Character' && 'text-highlight-1', 'cursor-pointer')}>Characters</span>
      |
      <span onClick={() => { setMode('Staff'); }} className={cx(mode === 'Staff' && 'text-highlight-1', 'cursor-pointer')}>Staff</span>
    </div>
  </div>
));

const isCharacter = item => item.RoleName === 'Seiyuu';

const SeriesCredits = () => {
  const { seriesId } = useParams();
  if (!seriesId) {
    return null;
  }
  const [mode, setMode] = useState('Character');
  const [search, setSearch] = useState('');

  const castData = useGetSeriesCastQuery({ seriesId });
  const cast = castData.data;
  
  return (
    <div className="flex gap-x-8">
      <ShokoPanel title="Search & Filter" className="w-[22.375rem] sticky top-0 shrink-0 h-fit" transparent contentClassName="gap-y-8" fullHeight={false}>
        <Input id="search" label="Character search" startIcon={mdiMagnify} type="text" placeholder="Search..." value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} />
      </ShokoPanel>

      <div className="flex flex-col grow gap-y-4">
        <div className="rounded-md bg-background-alt/50 px-8 py-4 flex justify-between items-center border-background-border border">
          <Heading mode={mode} setMode={setMode} />
          <div className="font-semibold text-xl"><span className="text-highlight-2">{cast?.length || 0}</span> Characters Listed</div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {map(filter(cast, value => mode === 'Character' ? isCharacter(value) : !isCharacter(value)), (item, idx) => (
            <div key={`${mode}-${idx}`} className="rounded-md bg-background-alt/50 p-8 gap-y-4 flex flex-col justify-center items-center border-background-border border font-semibold">
              <div className="flex gap-x-2 z-10">
                {mode === 'Character' && <CharacterImage imageSrc={getThumbnailUrl(item, 'Character')} className="h-[11.4375rem] w-[9rem] rounded-md relative" />}
                <CharacterImage imageSrc={getThumbnailUrl(item, 'Staff')} className="h-[11.4375rem] w-[9rem] rounded-md relative" />
              </div>
              <div className="text-xl">{item.Character?.Name}</div>
              <div className="opacity-65 -mt-2">{item.Staff?.Name}</div>
              <div>{item.RoleDetails}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesCredits;