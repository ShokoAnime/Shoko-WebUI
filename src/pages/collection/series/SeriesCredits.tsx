import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useGetSeriesCastQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { filter, get, map } from 'lodash';
import CharacterImage from '@/components/CharacterImage';
import { ImageType } from '@/core/types/api/common';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import cx from 'classnames';
import { SeriesCast } from '@/core/types/api/series';
import { mdiMagnify } from '@mdi/js';
import Input from '@/components/Input/Input';

const getThumbnailUrl = (item: SeriesCast, mode: string) => {
  const thumbnail = get<SeriesCast, string, ImageType | null>(item, `${mode}.Image`, null);
  if (thumbnail === null) { return null; }
  return `/api/v3/Image/${thumbnail.Source}/${thumbnail.Type}/${thumbnail.ID}`;
};

const Heading = React.memo(({ mode, setMode }:{ mode: string; setMode: Function; }) => (
  <div className="font-semibold text-xl">
    Credits
    <span className="px-2">&gt;</span>
    <span onClick={() => { setMode('Character'); }} className={cx(mode === 'Character' && 'text-highlight-1')}>Characters</span>
    <span className="px-2">|</span>
    <span onClick={() => { setMode('Staff'); }} className={cx(mode === 'Staff' && 'text-highlight-1')}>Staff</span>
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
    <div className="flex space-x-8">
      <div className="grow-0 shrink-0 w-[25rem] flex flex-col align-top">
        <div>
          <ShokoPanel title="Search & Filter" transparent>
            <div className="space-y-8">
              <Input id="search" label="Episode search" startIcon={mdiMagnify} type="text" placeholder="Search..." className="w-full bg-transparent" value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} />
            </div>
          </ShokoPanel>
        </div>
      </div>
      <div className="flex flex-col grow space-y-4">
        <div className="rounded bg-background-alt/25 px-8 py-4 flex justify-between items-center border-background-border border">
          <Heading mode={mode} setMode={setMode} />
          <div className="font-semibold text-xl"><span className="text-highlight-2">{cast?.length || 0}</span> Characters Listed</div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {map(filter(cast, value => mode === 'Character' ? isCharacter(value) : !isCharacter(value)), (item, idx) => (
            <div key={`${mode}-${idx}`} className="rounded bg-background-alt/25 p-8 space-y-4 flex flex-col justify-center items-center border-background-border border">
              <div className="flex space-x-2">
                {mode === 'Character' && <CharacterImage imageSrc={getThumbnailUrl(item, 'Character')} className="h-[11.4375rem] w-[9rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black" />}  
                <CharacterImage imageSrc={getThumbnailUrl(item, 'Staff')} className="h-[11.4375rem] w-[9rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black" />  
              </div>
              <div className="flex flex-col items-center">
                <span className="font-semibold text-xl">{item.Character?.Name}</span>
                <span className="font-semibold text-sm opacity-60">{item.Staff?.Name}</span>
              </div>
              <span className="font-semibold text-sm">{item.RoleDetails}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesCredits;