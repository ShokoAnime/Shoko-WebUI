import { useParams } from 'react-router';
import React, { useState } from 'react';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { get, map, split } from 'lodash';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import cx from 'classnames';
import { useGetSeriesImagesQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { ImageType } from '@/core/types/api/common';
import Checkbox from '@/components/Input/Checkbox';
import Button from '@/components/Input/Button';
import { mdiChevronRight } from '@mdi/js';
import { Icon } from '@mdi/react';

const Heading = React.memo(({ type, setType }:{ type: string; setType: Function; }) => (
  <div className="flex gap-x-2 font-semibold text-xl items-center">
    Images
    <Icon path={mdiChevronRight} size={1} />
    <div className="flex gap-x-1">
      <span onClick={() => { setType('Posters'); }} className={cx(type === 'Posters' && 'text-highlight-1')}>Poster</span>
      |
      <span onClick={() => { setType('Fanarts'); }} className={cx(type === 'Fanarts' && 'text-highlight-1')}>Fanart</span>
      |
      <span onClick={() => { setType('Banners'); }} className={cx(type === 'Banners' && 'text-highlight-1')}>Banners</span>
    </div>
  </div>
));

const getThumbnailUrl = (thumbnail: ImageType) => {
  if (thumbnail === null) { return null; }
  return `/api/v3/Image/${thumbnail.Source}/${thumbnail.Type}/${thumbnail.ID}`;
};

const InfoLine = ({ title, value }) => (
  <div className="flex flex-col gap-y-1">
    <span className="font-semibold text-font-main">{title}</span>
    {value}
  </div>
);

const SeriesImages = () => {
  const { seriesId } = useParams();
  if (!seriesId) {
    return null;
  }
  
  const [type, setType] = useState('Posters');
  const [selectedImage, setSelectedImage] = useState<ImageType>({} as ImageType);

  const imagesData = useGetSeriesImagesQuery({ seriesId });
  const images = imagesData.data;
  
  const splitPath = split(selectedImage?.RelativeFilepath ?? '-', '/');
  const filename = splitPath[0] === '-' ? '-' : splitPath.pop();
  const filepath = splitPath.join('/');
  
  const sizeMap = {
    'Posters': 'h-[20.0625rem] w-[13.75rem]',
    'Fanarts': 'h-[16rem] w-[28.29rem]',
    'Banners': 'h-[8rem] w-[43.25rem]',
  };

  return (
    <div className="flex gap-x-8">
      <div className="shrink-0 w-[22.375rem] flex flex-col gap-y-8 sticky top-0">
        <ShokoPanel title="Image Options" transparent contentClassName="gap-y-2 pointer-events-none opacity-50" fullHeight={false}>
          <Checkbox id="random-poster" isChecked={false} onChange={() => {}} label="Random Poster on Load" justify />
          <Checkbox id="random-fanart" isChecked={false} onChange={() => {}} label="Random Fanart on Load" justify />
        </ShokoPanel>
        <ShokoPanel title="Selected Image Info" transparent contentClassName="gap-y-4" fullHeight={false}>
          <InfoLine title="Filename" value={filename} />
          <InfoLine title="Location" value={filepath} />
          <InfoLine title="Source" value={selectedImage?.Source ?? '-'} />
          <InfoLine title="Size" value="-"/>
          <Button className="px-4 py-3 bg-highlight-1 text-font-alt rounded-md border border-background-border" disabled>
            Set As Series Poster
          </Button>
        </ShokoPanel>
      </div>

      <div className="flex flex-col grow gap-y-8">
        <div className="rounded-md bg-background-alt/50 px-8 py-4 flex justify-between items-center border-background-border border">
          <Heading type={type} setType={setType} />
          <div className="font-semibold text-xl"><span className="text-highlight-2">{get(images, type, []).length}</span> {type} Listed</div>
        </div>
        <div className="flex flex-wrap gap-4 rounded-md bg-background-alt/50 p-8 border-background-border border">
          {map(get(images, type, []), (item: ImageType) => (
            <div onClick={() => { setSelectedImage(item); }} key={item?.ID}>
              <BackgroundImagePlaceholderDiv imageSrc={getThumbnailUrl(item)} className={cx('rounded-md drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] relative border', item === selectedImage ? 'border-highlight-2 border-2 opacity-50' : 'border-background-border', sizeMap[type] )} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesImages;