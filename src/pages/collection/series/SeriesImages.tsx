import React, { useState } from 'react';
import { useParams } from 'react-router';
import { mdiStarCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { get, map, split, toNumber } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import Button from '@/components/Input/Button';
import MultiStateButton from '@/components/Input/MultiStateButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import { useChangeSeriesImageMutation } from '@/core/react-query/series/mutations';
import { useSeriesImagesQuery } from '@/core/react-query/series/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { ImageType } from '@/core/types/api/common';

type ImageTabType = 'Posters' | 'Fanarts' | 'Banners';
const tabStates = [
  { value: 'Posters' },
  { value: 'Fanarts' },
  { value: 'Banners' },
];

const InfoLine = ({ title, value }) => (
  <div className="flex w-full flex-col gap-y-1">
    <span className="font-semibold text-panel-text">{title}</span>
    <span className="line-clamp-1" title={`${value}`}>{value}</span>
  </div>
);

const sizeMap = {
  Posters: 'h-[15rem] w-[10rem] 2xl:h-[21rem] 2xl:w-[13.2rem]',
  Fanarts: 'h-[11.5rem] w-[22.5rem] 2xl:h-[16rem] 2xl:w-[27.75rem]',
  Banners: 'h-[8rem] w-[46rem] 2xl:w-[42.60rem]',
};

const isSizeMapType = (type: string): type is keyof typeof sizeMap => type in sizeMap;

const SeriesImages = () => {
  const { seriesId } = useParams();

  const [type, setType] = useState<ImageTabType>('Posters');
  const [selectedImage, setSelectedImage] = useState<ImageType>({} as ImageType);
  const images = useSeriesImagesQuery(toNumber(seriesId!), !!seriesId).data;
  const { mutate: changeImage } = useChangeSeriesImageMutation();

  const splitPath = split(selectedImage?.RelativeFilepath ?? '-', '/');
  const filename = splitPath[0] === '-' ? '-' : splitPath.pop();
  const filepath = splitPath.join('/');

  const resetSelectedImage = () => {
    setSelectedImage({} as ImageType);
  };

  const handleTabChange = useEventCallback((newType: ImageTabType) => {
    setType((prevType) => {
      if (newType !== prevType) resetSelectedImage();
      return newType;
    });
  });

  if (!seriesId) return null;
  if (!isSizeMapType(type)) return null;

  return (
    <div className="flex w-full gap-x-6">
      <div className="flex w-400 shrink-0 flex-col gap-y-6">
        <ShokoPanel
          title="Selected Image Info"
          className="w-full"
          contentClassName="flex !flex-col gap-y-6 2xl:gap-x-6 h-full"
          fullHeight={false}
          transparent
          sticky
        >
          <InfoLine title="Filename" value={filename} />
          <InfoLine title="Location" value={filepath} />
          <InfoLine title="Source" value={selectedImage?.Source ?? '-'} />
          <InfoLine title="Size" value="-" />
          <Button
            buttonType="primary"
            buttonSize="normal"
            disabled={!Object.keys(selectedImage).length || selectedImage.Preferred}
            onClick={() => {
              changeImage({ seriesId: toNumber(seriesId), image: selectedImage }, {
                onSuccess: () => {
                  resetSelectedImage();
                  toast.success(`Series ${selectedImage.Type} image has been changed.`);
                },
              });
            }}
          >
            {`Set As Series ${type.slice(0, -1)}`}
          </Button>
        </ShokoPanel>
      </div>
      <div className="flex grow flex-col gap-y-6">
        <div className="flex h-[6.125rem] items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent p-6">
          <div className="text-xl font-semibold">
            Images |&nbsp;
            <span className="text-panel-text-important">{get(images, type, []).length}</span>
            &nbsp;
            {type}
            &nbsp;Listed
          </div>
          <MultiStateButton activeState={type} onStateChange={handleTabChange} states={tabStates} />
        </div>
        <div className="flex flex-wrap gap-6 rounded-lg border border-panel-border bg-panel-background-transparent p-6">
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
                  'rounded-lg drop-shadow-md transition-transform outline',
                  item === selectedImage
                    ? 'outline-panel-text-important outline-4'
                    : 'outline-2 outline-panel-border',
                  sizeMap[type],
                )}
                linkToImage
                zoomOnHover
              >
                {item.Preferred && (
                  <div className="absolute bottom-3 mx-[5%] flex w-[90%] justify-center gap-2.5 rounded-lg bg-panel-background-overlay py-2 text-sm font-semibold text-panel-text opacity-100 transition-opacity group-hover:opacity-0">
                    <Icon path={mdiStarCircleOutline} size={1} />
                    Series Default
                  </div>
                )}
              </BackgroundImagePlaceholderDiv>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesImages;
