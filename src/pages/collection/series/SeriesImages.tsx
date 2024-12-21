import React, { useMemo, useState } from 'react';
import { useOutletContext, useParams } from 'react-router';
import { mdiStarCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { capitalize, split } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import Button from '@/components/Input/Button';
import MultiStateButton from '@/components/Input/MultiStateButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useChangeSeriesImageMutation } from '@/core/react-query/series/mutations';
import { useSeriesImagesQuery } from '@/core/react-query/series/queries';
import useEventCallback from '@/hooks/useEventCallback';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { SeriesContextType } from '@/components/Collection/constants';
import type { ImageType } from '@/core/types/api/common';

type ImageTabType = 'Posters' | 'Backdrops' | 'Logos';
const tabStates = [
  { value: 'Posters' },
  { value: 'Backdrops' },
  { value: 'Logos' },
];

const InfoLine = ({ title, value }) => (
  <div className="flex w-full flex-col gap-y-1">
    <span className="font-semibold text-panel-text">{title}</span>
    <span className="line-clamp-1" title={`${value}`}>{value}</span>
  </div>
);

const sizeMap = {
  Posters: { image: 'h-[clamp(15rem,_16vw,_21rem)]', grid: 'grid-cols-6' },
  Backdrops: { image: 'h-[clamp(11.5rem,_12vw,_16rem)]', grid: 'grid-cols-3' },
  Logos: { image: 'h-[clamp(15rem,_16vw,_21rem)]', grid: 'grid-cols-4' },
};

const SeriesImages = () => {
  const { imageType } = useParams();

  const { series } = useOutletContext<SeriesContextType>();

  const navigate = useNavigateVoid();

  const tabType = useMemo(() => {
    if (!imageType) return 'Posters';
    return capitalize(imageType) as ImageTabType;
  }, [imageType]);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const images = useSeriesImagesQuery(series.IDs.ID).data;
  const { mutate: changeImage } = useChangeSeriesImageMutation(series.IDs.ID);

  const splitPath = split(selectedImage?.RelativeFilepath ?? '-', '/');
  const filename = splitPath[0] === '-' ? '-' : splitPath.pop();
  const filepath = splitPath[0] ? splitPath.join('/') : '-';

  const handleSelectionChange = (item: ImageType) => {
    setSelectedImage(old => ((old === item) ? null : item));
  };

  const handleSetPreferredImage = useEventCallback(() => {
    if (!selectedImage) return;
    changeImage(selectedImage, {
      onSuccess: () => setSelectedImage(null),
    });
  });

  const handleTabChange = useEventCallback((newType: ImageTabType) => {
    setSelectedImage(null);
    navigate(`../images/${newType.toLowerCase()}`);
  });

  return (
    <>
      <title>{`${series.Name} > Images | Shoko`}</title>
      <div className="flex w-full gap-x-6">
        <div className="flex w-100 min-w-64 flex-col">
          <ShokoPanel
            title="Selected Image Info"
            contentClassName="gap-y-6"
            fullHeight={false}
            transparent
            sticky
          >
            <InfoLine title="Filename" value={filename} />
            <InfoLine title="Location" value={filepath} />
            <InfoLine title="Source" value={selectedImage?.Source ?? '-'} />
            <InfoLine
              title="Size"
              value={selectedImage?.Width && selectedImage?.Height
                ? `${selectedImage.Width} x ${selectedImage.Height}`
                : '-'}
            />
            <Button
              buttonType="primary"
              buttonSize="normal"
              disabled={!selectedImage || selectedImage.Preferred}
              onClick={handleSetPreferredImage}
            >
              {`Set As Preferred ${tabType.slice(0, -1)}`}
            </Button>
          </ShokoPanel>
        </div>
        <div className="flex grow flex-col gap-y-6">
          <div className="flex h-[6.125rem] items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent p-6">
            <div className="text-xl font-semibold">
              Images |&nbsp;
              <span className="text-panel-text-important">{images?.[tabType]?.length ?? '-'}</span>
              &nbsp;
              {tabType}
              &nbsp;Listed
            </div>
            <MultiStateButton activeState={tabType} onStateChange={handleTabChange} states={tabStates} />
          </div>
          <div
            className={cx(
              sizeMap[tabType].grid,
              'grid gap-6 rounded-lg border border-panel-border bg-panel-background-transparent p-6',
            )}
          >
            {images?.[tabType].map(item => (
              <div
                onClick={() => handleSelectionChange(item)}
                key={`${item.Source}-${item.Type}-${item.ID}`}
                className="group flex cursor-pointer items-center justify-between"
              >
                <BackgroundImagePlaceholderDiv
                  image={item}
                  contain={tabType === 'Logos'}
                  className={cx(
                    'rounded-lg drop-shadow-md transition-transform outline grow',
                    item === selectedImage
                      ? 'outline-panel-text-important outline-4'
                      : 'outline-2 outline-panel-border',
                    sizeMap[tabType].image,
                  )}
                  linkToImage
                  zoomOnHover
                >
                  {item.Preferred && (
                    <div className="absolute bottom-2 mx-[5%] flex w-[90%] justify-center gap-2.5 rounded-lg bg-panel-background-overlay py-2 text-sm font-semibold text-panel-text opacity-100 transition-opacity group-hover:opacity-0">
                      <Icon path={mdiStarCircleOutline} size={1} />
                      Preferred
                    </div>
                  )}
                </BackgroundImagePlaceholderDiv>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SeriesImages;
