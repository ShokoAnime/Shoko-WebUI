import React, { useState } from 'react';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import { mdiAccountTieOutline } from '@mdi/js';

type Props = {
  children?: any;
  className?: string;
  imageSrc: string | null;
  hidePlaceholderOnHover?: boolean;
};

function CharacterImage(props: Props) {
  const {
    children, className,
    imageSrc, hidePlaceholderOnHover,
  } = props;

  const [imageLoaded, setImageLoaded] = useState(false);

  const backgroundImage = new Image();
  if (imageSrc !== undefined && imageSrc !== null) {
    backgroundImage.onload = () => setImageLoaded(true);
    backgroundImage.src = imageSrc;
  }

  return (
    <div className={`${className} overflow-hidden`}>
      <div className="absolute w-full h-full flex flex-col top-0 left-0 text-center z-[-1] group" style={{ background: imageLoaded ? `50% 0% / cover no-repeat url('${backgroundImage.src}')` : undefined }}>
        {!imageLoaded && (
          <div className={cx('w-full h-full flex flex-col justify-center items-center bg-default-background p-8', hidePlaceholderOnHover && 'group-hover:opacity-0')}>
            <Icon path={mdiAccountTieOutline} size={10} className="opacity-65" />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export default React.memo(CharacterImage);
