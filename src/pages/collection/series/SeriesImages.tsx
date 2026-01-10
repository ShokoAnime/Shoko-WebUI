import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { SeriesContextType } from '@/components/Collection/constants';
import type { ImageType } from '@/core/types/api/common';

type ImageTabType = 'Posters' | 'Backdrops' | 'Logos';

const InfoLine = ({ titleKey, value }: { titleKey: string, value: string }) => {
  const { t } = useTranslation('series');
  return (
    <div className="flex w-full flex-col gap-y-1">
      <span className="font-semibold text-panel-text">{t(`images.info.${titleKey}`)}</span>
      <span className="line-clamp-1" title={value}>{value}</span>
    </div>
  );
};

const sizeMap = {
  Posters: { image: 'h-[clamp(15rem,_16vw,_21rem)]', grid: 'grid-cols-6' },
  Backdrops: { image: 'h-[clamp(11.5rem,_12vw,_16rem)]', grid: 'grid-cols-3' },
  Logos: { image: 'h-[clamp(15rem,_16vw,_21rem)]', grid: 'grid-cols-4' },
};

const SeriesImages = () => {
  const { t } = useTranslation('series');
  const tabStates = [
    { label: t('images.tabs.posters'), value: 'Posters' },
    { label: t('images.tabs.backdrops'), value: 'Backdrops' },
    { label: t('images.tabs.logos'), value: 'Logos' },
  ];
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

  const handleSetPreferredImage = () => {
    if (!selectedImage) return;
    changeImage(selectedImage, {
      onSuccess: () => setSelectedImage(null),
    });
  };

  const handleTabChange = (newType: ImageTabType) => {
    setSelectedImage(null);
    navigate(`../images/${newType.toLowerCase()}`);
  };

  return (
    <>
      <title>{t('pageTitle.images', { name: series.Name })}</title>
      <div className="flex w-full gap-x-6">
        <div className="flex w-100 min-w-64 flex-col">
          <ShokoPanel
            title={t('images.selectedInfo')}
            contentClassName="gap-y-6"
            fullHeight={false}
            transparent
            sticky
          >
            <InfoLine titleKey="filename" value={filename ?? 'N/A'} />
            <InfoLine titleKey="location" value={filepath} />
            <InfoLine titleKey="source" value={selectedImage?.Source ?? '-'} />
            <InfoLine
              titleKey="size"
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
              {t('images.setPreferred', { type: t(`images.preferredSingular.${tabType.toLowerCase()}`) })}
            </Button>
          </ShokoPanel>
        </div>
        <div className="flex grow flex-col gap-y-6">
          <div className="flex h-[6.125rem] items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent p-6">
            <div className="text-xl font-semibold">
              {t('images.title')}
              &nbsp;|&nbsp;
              <span className="text-panel-text-important">
                {images?.[tabType]?.length ?? '-'}
              </span>
              &nbsp;
              {t('images.headerUnit', {
                type: t(`images.tabs.${tabType.toLowerCase()}`),
              })}
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
                      {t('images.preferred')}
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
