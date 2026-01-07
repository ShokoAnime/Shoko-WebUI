import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mdiInformationOutline, mdiLoading, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import { useSettingsQuery } from '@/core/react-query/settings/queries';

import type { ImageType } from '@/core/types/api/common';

type Props = {
  children?: React.ReactNode;
  className?: string;
  contain?: boolean;
  image?: ImageType;
  hidePlaceholderOnHover?: boolean;
  overlayOnHover?: boolean;
  zoomOnHover?: boolean;
  linkToImage?: boolean;
};

const BackgroundImagePlaceholderDiv = React.memo((props: Props) => {
  const { t } = useTranslation('components');
  const {
    children,
    className,
    contain,
    hidePlaceholderOnHover,
    image,
    linkToImage,
    overlayOnHover,
    zoomOnHover,
  } = props;
  const fit = contain ? 'contain' : 'cover';
  const settings = useSettingsQuery().data;
  const imageSource = useMemo(() => {
    if (!image) {
      return undefined;
    }

    if (!settings.LoadImageMetadata && !image.RelativeFilepath) {
      return null;
    }

    return `/api/v3/Image/${image.Source}/${image.Type}/${image.ID}`;
  }, [image, settings.LoadImageMetadata]);

  const [imageError, setImageError] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(() => new Image());

  useEffect(() => {
    setBackgroundImage(null);
    if (!imageSource) {
      setImageError(
        imageSource === null
          ? t('background_image_placeholder.image_not_available')
          : t('background_image_placeholder.no_image_metadata'),
      );
      return undefined;
    }
    setImageError(null);

    let complete = false;
    const background = new Image();
    background.setAttribute('lazy', 'true');
    background.onload = () => {
      if (complete) return;
      complete = true;
      setBackgroundImage(background);
    };
    background.onerror = () => {
      if (complete) return;
      complete = true;
      setImageError(t('background_image_placeholder.refresh_browser'));
    };
    background.src = imageSource;
    return () => {
      complete = true;
    };
  }, [imageSource, t]);

  return (
    <div className={cx(className, 'relative overflow-hidden')}>
      <div
        className={cx(
          'absolute w-full h-full flex flex-col top-0 left-0 text-center z-[-1] rounded-lg',
          zoomOnHover && 'group-hover:scale-105 transition-transform duration-600',
        )}
        style={{ background: backgroundImage ? `center / ${fit} no-repeat url('${backgroundImage.src}')` : undefined }}
      >
        {imageError && (
          <div
            className={cx(
              'w-full h-full flex flex-col justify-center items-center bg-panel-input p-6',
              hidePlaceholderOnHover && 'group-hover:opacity-0',
            )}
          >
            <Icon path={mdiInformationOutline} size={1.5} className="text-panel-icon-important" />
            <div className="my-4 font-semibold">
              {t('background_image_placeholder.failed_to_load')}
            </div>
            {imageError}
          </div>
        )}
        {!backgroundImage && !imageError && (
          <div className="flex grow items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} spin size={3} />
          </div>
        )}
      </div>
      {children}
      {linkToImage && !imageError && backgroundImage?.src && (
        <a
          className="absolute bottom-2 right-2 z-10 rounded-lg bg-panel-background-overlay p-2 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
          href={backgroundImage.src}
          aria-label={t('background_image_placeholder.link_to_image')}
          rel="noopener noreferrer"
          target="_blank"
          onClick={event => event.stopPropagation()}
        >
          <Icon path={mdiOpenInNew} size={1} />
        </a>
      )}
      {overlayOnHover && (
        <div className="pointer-events-none z-50 flex h-full bg-panel-background-poster-overlay p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100" />
      )}
    </div>
  );
});

export default BackgroundImagePlaceholderDiv;
