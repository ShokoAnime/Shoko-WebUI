import React, { useState } from 'react';
import { useParams } from 'react-router';
import { mdiChevronRight } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { get, map, split, toNumber } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import { useChangeSeriesImageMutation } from '@/core/react-query/series/mutations';
import { useSeriesImagesQuery } from '@/core/react-query/series/queries';

import type { ImageType } from '@/core/types/api/common';

const Heading = React.memo((
  { onTypeChange, setType, type }: { type: string, setType: (type: string) => void, onTypeChange: () => void },
) => (
  <div className="flex cursor-pointer items-center gap-x-2 text-xl font-semibold">
    Images
    <Icon path={mdiChevronRight} size={1} />
    <div className="flex gap-x-1">
      <span
        onClick={() => {
          setType('Posters');
          onTypeChange();
        }}
        className={cx(type === 'Posters' && 'text-panel-text-primary')}
      >
        Posters
      </span>
      |
      <span
        onClick={() => {
          setType('Fanarts');
        }}
        className={cx(type === 'Fanarts' && 'text-panel-text-primary')}
      >
        Fanarts
      </span>
      |
      <span
        onClick={() => {
          setType('Banners');
        }}
        className={cx(type === 'Banners' && 'text-panel-text-primary')}
      >
        Banners
      </span>
    </div>
  </div>
));

const InfoLine = ({ title, value }) => (
  <div className="flex w-full max-w-[12.5rem] flex-col gap-y-1">
    <span className="font-semibold text-panel-text">{title}</span>
    <span className="line-clamp-1" title={`${value}`}>{value}</span>
  </div>
);

const sizeMap = {
  Posters: 'h-[15rem] w-[10rem] 2xl:h-[21rem] 2xl:w-[13rem]',
  Fanarts: 'h-[11.5rem] w-[22.5rem] 2xl:h-[16rem] 2xl:w-[26.55rem]',
  Banners: 'h-[8rem] w-[46rem] 2xl:w-[41rem]',
};

const isSizeMapType = (type: string): type is keyof typeof sizeMap => type in sizeMap;

const SeriesImages = () => {
  const { seriesId } = useParams();

  const [type, setType] = useState('Posters');
  const [selectedImage, setSelectedImage] = useState<ImageType>({} as ImageType);
  const images = useSeriesImagesQuery(toNumber(seriesId!), !!seriesId).data;
  const { mutate: changeImage } = useChangeSeriesImageMutation();

  const splitPath = split(selectedImage?.RelativeFilepath ?? '-', '/');
  const filename = splitPath[0] === '-' ? '-' : splitPath.pop();
  const filepath = splitPath.join('/');

  const resetSelectedImage = () => {
    setSelectedImage({} as ImageType);
  };

  if (!seriesId) return null;
  if (!isSizeMapType(type)) return null;

  return (
    <div className="flex gap-x-6">
      <div className="flex grow flex-col gap-y-6">
        <div className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent px-6 py-4">
          <Heading type={type} setType={setType} onTypeChange={resetSelectedImage} />
          <div className="text-xl font-semibold">
            <span className="text-panel-text-important">{get(images, type, []).length}</span>
            &nbsp;
            {type}
            &nbsp;Listed
          </div>
        </div>
        <ShokoPanel
          title="Selected Image Info"
          className="flex w-full flex-row"
          contentClassName="flex !flex-row gap-x-2 2xl:gap-x-6 h-full"
          fullHeight={false}
          transparent
        >
          <InfoLine title="Filename" value={filename} />
          <InfoLine title="Location" value={filepath} />
          <InfoLine title="Source" value={selectedImage?.Source ?? '-'} />
          <InfoLine title="Size" value="-" />
          <Button
            buttonType="primary"
            className="rounded-lg border border-panel-border p-3 font-semibold"
            disabled={!Object.keys(selectedImage).length || selectedImage.Preferred}
            onClick={() => {
              changeImage({ seriesId: toNumber(seriesId), image: selectedImage }, {
                onSuccess: () => {
                  setSelectedImage({} as ImageType);
                  toast.success(`Series ${selectedImage.Type} image has been changed.`);
                },
              });
            }}
          >
            {`Set As Default ${type.slice(0, -1)}`}
          </Button>
        </ShokoPanel>
        <div className="flex flex-wrap gap-4 rounded-lg border border-panel-border bg-panel-background-transparent p-4">
          {map(get(images, type, []), (item: ImageType) => (
            <div
              onClick={() => {
                if (selectedImage === item) resetSelectedImage();
                else setSelectedImage(item);
              }}
              key={item?.ID}
            >
              <BackgroundImagePlaceholderDiv
                image={item}
                className={cx(
                  'rounded-lg drop-shadow-md border',
                  item === selectedImage ? 'border-panel-text-important border-2 opacity-65' : 'border-panel-border',
                  sizeMap[type],
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesImages;
