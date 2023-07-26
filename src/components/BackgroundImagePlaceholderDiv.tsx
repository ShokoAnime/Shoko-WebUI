import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import { mdiInformationOutline, mdiLoading } from '@mdi/js';

type Props = {
  children?: any;
  className?: string;
  imageSrc: string | null;
  hidePlaceholderOnHover?: boolean;
  zoomOnHover?: boolean;
};

function BackgroundImagePlaceholderDiv(props: Props) {
  const {
    children, className, zoomOnHover,
    imageSrc, hidePlaceholderOnHover,
  } = props;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(new Image());

  useEffect(() => {
    if (!imageSrc) return;
    const image = new Image();
    image.onload = () => setImageLoaded(true);
    image.onerror = () => setImageError(true);
    image.src = imageSrc;
    setBackgroundImage(image);
  }, [imageSrc]);

  return (
    <div className={`${className} overflow-hidden`}>
      <div className={cx('absolute w-full h-full flex flex-col top-0 left-0 text-center z-[-1]', zoomOnHover && 'group-hover:scale-105 transition-transform')} style={{ background: imageLoaded ? `center / cover no-repeat url('${backgroundImage.src}')` : undefined }}>
        {imageError && (
          <div className={cx('w-full h-full flex flex-col justify-center items-center bg-overlay-background p-8', hidePlaceholderOnHover && 'group-hover:opacity-0')}>
            <Icon path={mdiInformationOutline} size={1.5} className="text-default-important" />
            <div className="my-4 font-semibold">Failed to Load</div>
            Please refresh your browser to correct
          </div>
        )}
        {!imageLoaded && !imageError && (
          <div className="flex grow items-center justify-center text-default-primary">
            <Icon path={mdiLoading} spin size={3} />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export default React.memo(BackgroundImagePlaceholderDiv);
