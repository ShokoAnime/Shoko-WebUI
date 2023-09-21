import React, { useEffect, useMemo, useState } from 'react';
import { mdiInformationOutline, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import type { ImageType } from '@/core/types/api/common';

type Props = {
  children?: any;
  className?: string;
  image: ImageType | null;
  hidePlaceholderOnHover?: boolean;
  zoomOnHover?: boolean;
};

function BackgroundImagePlaceholderDiv(props: Props) {
  const {
    children,
    className,
    hidePlaceholderOnHover,
    image,
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
    <div className={`${className} relative overflow-hidden`}>
      <div
        className={cx(
          'absolute w-full h-full flex flex-col top-0 left-0 text-center z-[-1]',
          zoomOnHover && 'group-hover:scale-105 transition-transform',
        )}
        style={{ background: backgroundImage ? `center / cover no-repeat url('${backgroundImage.src}')` : undefined }}
      >
        {imageError && (
          <div
            className={cx(
              'w-full h-full flex flex-col justify-center items-center bg-overlay-background p-8',
              hidePlaceholderOnHover && 'group-hover:opacity-0',
            )}
          >
            <Icon path={mdiInformationOutline} size={1.5} className="text-panel-important" />
            <div className="my-4 font-semibold">Failed to Load</div>
            {imageError}
          </div>
        )}
        {!backgroundImage && !imageError && (
          <div className="flex grow items-center justify-center text-panel-primary">
            <Icon path={mdiLoading} spin size={3} />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export default React.memo(BackgroundImagePlaceholderDiv);
