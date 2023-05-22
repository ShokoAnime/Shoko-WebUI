import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useGetSeriesCastQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { filter, get, map } from 'lodash';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { ImageType } from '@/core/types/api/common';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import cx from 'classnames';
import { SeriesCast } from '@/core/types/api/series';

const getThumbnailUrl = (item: SeriesCast, mode: string) => {
  const thumbnail = get<SeriesCast, string, ImageType | null>(item, `${mode}.Image`, null);
  if (thumbnail === null) { return null; }
  return `/api/v3/Image/${thumbnail.Source}/${thumbnail.Type}/${thumbnail.ID}`;
};

const Heading = React.memo(({ mode, setMode }:{ mode: string; setMode: Function; }) => (
  <React.Fragment>
    Credits
    <span className="px-2">&gt;</span>
    <span onClick={() => { setMode('Character'); }} className={cx(mode === 'Character' && 'text-highlight-1')}>Characters</span>
    <span className="px-2">|</span>
    <span onClick={() => { setMode('Staff'); }} className={cx(mode === 'Staff' && 'text-highlight-1')}>Staff</span>
  </React.Fragment>
));

const isCharacter = item => item.RoleName === 'Seiyuu';


const SeriesCredits = () => {
  const { seriesId } = useParams();
  if (!seriesId) {
    return null;
  }
  const [mode, setMode] = useState('Character');

  const castData = useGetSeriesCastQuery({ seriesId });
  const cast = castData.data;
  
  return (
    <ShokoPanel title={<Heading mode={mode} setMode={setMode} />}>
      <div className="grid grid-cols-5 gap-7">
        {map(filter(cast, value => mode === 'Character' ? isCharacter(value) : !isCharacter(value)), (item, idx) => (
          <div key={`${mode}-${idx}`} className="flex space-x-3 text-font-main">
            <BackgroundImagePlaceholderDiv imageSrc={getThumbnailUrl(item, mode)} className="h-[8.5rem] min-w-[6.5625rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
            <div className="flex flex-col">
              <span className="font-semibold">{item.Character?.Name}</span>
              <span className="text-sm opacity-60">{item.Staff?.Name}</span>
              <span className="text-sm opacity-60">{item.RoleName}</span>
              <span className="text-sm opacity-60">{item.RoleDetails}</span>
            </div>
          </div>
        ))}
      </div>
    </ShokoPanel>
  );
};

export default SeriesCredits;