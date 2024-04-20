import React, { useEffect, useMemo, useState } from 'react';
import { mdiInformationOutline, mdiLoading, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import type { ImageType } from '@/core/types/api/common';

type Props = {
  children?: React.ReactNode;
  className?: string;
  image: ImageType | null;
  hidePlaceholderOnHover?: boolean;
  overlayOnHover?: boolean;
  zoomOnHover?: boolean;
  zoomOnBoolValue?: boolean;
  linkToImage?: boolean;
};

const BackgroundImagePlaceholderDiv = React.memo((props: Props) => {
  const {
    children,
    className,
    hidePlaceholderOnHover,
    image,
    linkToImage,
    overlayOnHover,
    zoomOnBoolValue,
    zoomOnHover,
  } = props;
  const imageSource = useMemo(() => {
    if (!image) {
      return undefined;
    }

    if (!image.RelativeFilepath) {
      return null;
    }

    return `/api/v3/Image/${image.Source}/${image.Type}/${image.ID}`;
  }, [image]);

  const [imageError, setImageError] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(() => new Image());

  useEffect(() => {
    setBackgroundImage(null);
    if (!imageSource) {
      setImageError(
        imageSource === null
          ? (
            'Image is not available. Run the validate image action or wait for the image queue to settle.'
          )
          : (
            'No image metadata.'
          ),
      );
      return undefined;
    }
    setImageError(null);

    let complete = false;
    const bg = new Image();
    bg.setAttribute('lazy', 'true');
    bg.onload = () => {
      if (complete) return;
      complete = true;
      setBackgroundImage(bg);
    };
    bg.onerror = () => {
      if (complete) return;
      complete = true;
      setImageError('Please refresh your browser to correct.');
    };
    bg.src = imageSource;
    return () => {
      complete = true;
    };
  }, [imageSource]);

  return (
    <div
      className={cx(
        className,
        linkToImage && 'group',
        'relative overflow-hidden',
      )}
    >
      <div
        className={cx(
          'absolute w-full h-full flex flex-col top-0 left-0 text-center z-[-1] rounded-lg',
          zoomOnHover && 'group-hover:scale-105 transition-transform',
          typeof zoomOnBoolValue !== 'undefined' && 'transition-transform duration-600',
          zoomOnBoolValue && 'scale-105',
        )}
        style={{ background: backgroundImage ? `center / cover no-repeat url('${backgroundImage.src}')` : undefined }}
      >
        {imageError && (
          <div
            className={cx(
              'w-full h-full flex flex-col justify-center items-center bg-panel-input p-6',
              hidePlaceholderOnHover && 'group-hover:opacity-0',
            )}
          >
            <Icon path={mdiInformationOutline} size={1.5} className="text-panel-icon-important" />
            <div className="my-4 font-semibold">Failed to Load</div>
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
      {linkToImage && (
        <a
          className="absolute bottom-2 right-2 z-10 rounded-lg bg-panel-background-transparent p-2 opacity-0 shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition group-hover:opacity-100"
          href={backgroundImage?.src}
          aria-label="Link to image"
          rel="noopener noreferrer"
          target="_blank"
          onClick={e => e.stopPropagation()}
        >
          <Icon path={mdiOpenInNew} size={1} />
        </a>
      )}
      {overlayOnHover && (
        <div className="pointer-events-none z-50 flex h-full bg-panel-background-transparent p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100" />
      )}
    </div>
  );
});

export default BackgroundImagePlaceholderDiv;
