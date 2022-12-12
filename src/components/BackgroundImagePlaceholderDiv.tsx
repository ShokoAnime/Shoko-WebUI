import React, { useState } from 'react';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import { mdiInformationOutline } from '@mdi/js';

type Props = {
  children?: any;
  className?: string;
  imageSrc: string;
  hidePlaceholderOnHover?: boolean;
};

function BackgroundImagePlaceholderDiv(props: Props) {
  const {
    children, className,
    imageSrc, hidePlaceholderOnHover,
  } = props;

  const [imageLoaded, setImageLoaded] = useState(false);

  const backgroundImage = new Image();
  backgroundImage.onload = () => setImageLoaded(true);
  backgroundImage.src = imageSrc;

  return (
    <div className={`${className} overflow-hidden`}>
      <div className="absolute w-full h-full flex flex-col top-0 left-0 text-center z-[-1] group" style={{ background: imageLoaded ? `center / cover no-repeat url('${backgroundImage.src}')` : undefined }}>
        {!imageLoaded && (
          <div className={cx('w-full h-full flex flex-col justify-center items-center bg-background-nav p-8', hidePlaceholderOnHover && 'group-hover:opacity-0')}>
            <Icon path={mdiInformationOutline} size={1.5} className="text-highlight-2" />
            <div className="my-4 font-semibold">Failed to Load</div>
            Please refresh your browser to correct
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export default React.memo(BackgroundImagePlaceholderDiv);
