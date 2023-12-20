import React, { useState } from 'react';
import { useParams } from 'react-router';
import { mdiChevronRight } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { get, map, split, toNumber } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
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
  <div className="flex flex-col gap-y-1">
    <span className="font-semibold text-panel-text">{title}</span>
    {value}
  </div>
);

const SeriesImages = () => {
  const { seriesId } = useParams();

  const [type, setType] = useState('Posters');
  const [selectedImage, setSelectedImage] = useState<ImageType>({} as ImageType);
  const imagesData = useSeriesImagesQuery(toNumber(seriesId!), !!seriesId);
  const { mutate: changeImage } = useChangeSeriesImageMutation();
  const images = imagesData.data;

  const splitPath = split(selectedImage?.RelativeFilepath ?? '-', '/');
  const filename = splitPath[0] === '-' ? '-' : splitPath.pop();
  const filepath = splitPath.join('/');

  const sizeMap = {
    Posters: 'h-[20.0625rem] w-[13.75rem]',
    Fanarts: 'h-[16rem] w-[28.29rem]',
    Banners: 'h-[8rem] w-[43.25rem]',
  };

  const resetSelectedImage = () => {
    setSelectedImage({} as ImageType);
  };

  if (!seriesId) return null;

  return (
    <div className="flex gap-x-8">
      <div className="sticky top-0 flex w-[22.375rem] shrink-0 flex-col gap-y-8">
        <ShokoPanel
          title="Image Options"
          transparent
          contentClassName="gap-y-2 pointer-events-none opacity-50"
          fullHeight={false}
        >
          <Checkbox id="random-poster" isChecked={false} onChange={() => {}} label="Random Poster on Load" justify />
          <Checkbox id="random-fanart" isChecked={false} onChange={() => {}} label="Random Fanart on Load" justify />
        </ShokoPanel>
        <ShokoPanel title="Selected Image Info" transparent contentClassName="gap-y-4" fullHeight={false}>
          <InfoLine title="Filename" value={filename} />
          <InfoLine title="Location" value={filepath} />
          <InfoLine title="Source" value={selectedImage?.Source ?? '-'} />
          <InfoLine title="Size" value="-" />
          <Button
            buttonType="primary"
            className="rounded-md border border-panel-border px-4 py-3 font-semibold"
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
      </div>

      <div className="flex grow flex-col gap-y-8">
        <div className="flex items-center justify-between rounded-md border border-panel-border bg-panel-background-transparent px-8 py-4">
          <Heading type={type} setType={setType} onTypeChange={resetSelectedImage} />
          <div className="text-xl font-semibold">
            <span className="text-panel-text-important">{get(images, type, []).length}</span>
            &nbsp;
            {type}
            &nbsp;Listed
          </div>
        </div>
        <div className="flex flex-wrap gap-4 rounded-md border border-panel-border bg-panel-background-transparent p-8">
          {map(get(images, type, []), (item: ImageType) => (
            <div
              onClick={() => {
                setSelectedImage(item);
              }}
              key={item?.ID}
            >
              <BackgroundImagePlaceholderDiv
                image={item}
                className={cx(
                  'rounded-md drop-shadow-md border',
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
