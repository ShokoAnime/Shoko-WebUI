import { useParams } from 'react-router';
import React, { useState } from 'react';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { get, map, split } from 'lodash';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import cx from 'classnames';
import { useGetSeriesImagesQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { ImageType } from '@/core/types/api/common';
import Checkbox from '@/components/Input/Checkbox';

const Heading = React.memo(({ type, setType }:{ type: string; setType: Function; }) => (
  <div className="font-semibold text-xl">
    Images
    <span className="px-2">&gt;</span>
    <span onClick={() => { setType('Posters'); }} className={cx(type === 'Posters' && 'text-highlight-1')}>Poster</span>
    <span className="px-2">|</span>
    <span onClick={() => { setType('Fanarts'); }} className={cx(type === 'Fanarts' && 'text-highlight-1')}>Fanart</span>
    <span className="px-2">|</span>
    <span onClick={() => { setType('Banners'); }} className={cx(type === 'Banners' && 'text-highlight-1')}>Banners</span>
  </div>
));

const getThumbnailUrl = (thumbnail: ImageType) => {
  if (thumbnail === null) { return null; }
  return `/api/v3/Image/${thumbnail.Source}/${thumbnail.Type}/${thumbnail.ID}`;
};

const InfoLine = ({ title, value }) => (
  <div className="flex flex-col space-y-1">
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
  
  const splitPath = split(selectedImage?.RelativeFilepath, '/');
  const filename = splitPath.pop();
  const filepath = splitPath.join('/');
  
  const sizeMap = {
    'Posters': 'h-[20.0625rem] w-[13.75rem]',
    'Fanarts': 'h-[16rem] w-[28.5rem]',
    'Banners': 'h-[8rem] w-[43.25rem]',
  };

  return (
    <div className="flex space-x-8">
      <div className="grow-0 shrink-0 w-[22.375rem] flex flex-col align-top space-y-8">
        <ShokoPanel title="Image Options" transparent className="grow-0">
          <div className="flex flex-col space-y-1">
            <Checkbox id="random-poster" isChecked={false} onChange={() => {}} label="Random Poster on Load" justify />
            <Checkbox id="random-fanart" isChecked={false} onChange={() => {}} label="Random Fanart on Load" justify />
          </div>
        </ShokoPanel>
        <ShokoPanel title="Selected Image Info" transparent className="min-h-[25rem]">
          <div className="flex flex-col space-y-4">
            <InfoLine title="Filename" value={filename}/>
            <InfoLine title="Location" value={filepath}/>
            <InfoLine title="Source" value={selectedImage?.Source}/>
            <InfoLine title="Size" value="--"/>
          </div>
        </ShokoPanel>
      </div>
      <div className="flex flex-col grow space-y-8">
        <div className="rounded bg-background-alt/25 px-8 py-4 flex justify-between items-center border-background-border border">
          <Heading type={type} setType={setType} />
          <div className="font-semibold text-xl"><span className="text-highlight-2">{get(images, type, []).length}</span> {type} Listed</div>
        </div>
        <div className="flex flex-wrap gap-4 rounded bg-background-alt/25 p-8 border-background-border border">
          {map(get(images, type, []), (item: ImageType) => (
            <div onClick={() => { setSelectedImage(item); }} key={item?.ID}>
              <BackgroundImagePlaceholderDiv imageSrc={getThumbnailUrl(item)} className={cx('rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border', item === selectedImage ? 'border-highlight-2 border-2 opacity-50' : 'border-black', sizeMap[type] )} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesImages;