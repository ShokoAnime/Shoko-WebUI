import { useParams } from 'react-router';
import React, { useState } from 'react';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import { get, map, split } from 'lodash';
import BackgroundImagePlaceholderDiv from '../../../components/BackgroundImagePlaceholderDiv';
import cx from 'classnames';
import { useGetSeriesImagesQuery } from '../../../core/rtkQuery/splitV3Api/seriesApi';
import { ImageType } from '../../../core/types/api/common';

const Heading = React.memo(({ type, setType }:{ type: string; setType: Function; }) => (
  <React.Fragment>
    Images
    <span className="px-2">&gt;</span>
    <span onClick={() => { setType('Posters'); }} className={cx(type === 'Posters' && 'text-highlight-1')}>Poster</span>
    <span className="px-2">|</span>
    <span onClick={() => { setType('Fanarts'); }} className={cx(type === 'Fanarts' && 'text-highlight-1')}>Fanart</span>
    <span className="px-2">|</span>
    <span onClick={() => { setType('Banners'); }} className={cx(type === 'Banners' && 'text-highlight-1')}>Banners</span>
  </React.Fragment>
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
    'Posters': 'h-[21.375rem] w-[15.2678rem]',
    'Fanarts': 'h-[19.2375rem] w-[34.2rem]',
    'Banners': 'h-[19.2375rem] w-[104.157rem]',
  };

  return (
    <div className="flex space-x-9">
      <ShokoPanel className="grow" title={<Heading type={type} setType={setType} />}>
        <div className="flex flex-wrap">
          {map(get(images, type, []), (item: ImageType) => (
            <div onClick={() => { setSelectedImage(item); }} key={item?.ID}>
              <BackgroundImagePlaceholderDiv imageSrc={getThumbnailUrl(item)} className={cx('rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border my-2 mr-4', item === selectedImage ? 'border-highlight-2 border-2 opacity-30' : 'border-black', sizeMap[type] )} />
            </div>
          ))}
        </div>
      </ShokoPanel>
      <ShokoPanel className="shrink-0 min-w-[23rem]" title="Selected Image Info">
        <div className="flex flex-col space-y-4">
          <InfoLine title="Filename" value={filename}/>
          <InfoLine title="Location" value={filepath}/>
          <InfoLine title="Source" value={selectedImage?.Source}/>
          <InfoLine title="Size" value="--"/>
        </div>
      </ShokoPanel>
    </div>
  );
};

export default SeriesImages;