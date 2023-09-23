import React, { useState } from 'react';
import { mdiAccountTieOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

type Props = {
  children?: React.ReactNode;
  className?: string;
  imageSrc: string | null;
  hidePlaceholderOnHover?: boolean;
};

function CharacterImage(props: Props) {
  const {
    children,
    className,
    hidePlaceholderOnHover,
    imageSrc,
  } = props;

  const [imageLoaded, setImageLoaded] = useState(false);

  const backgroundImage = new Image();
  if (imageSrc !== undefined && imageSrc !== null) {
    backgroundImage.onload = () => setImageLoaded(true);
    backgroundImage.src = imageSrc;
  }

  return (
    <div className={`${className} overflow-hidden`}>
      <div
        className="group absolute left-0 top-0 z-[-1] flex h-full w-full flex-col text-center"
        style={{ background: imageLoaded ? `50% 0% / cover no-repeat url('${backgroundImage.src}')` : undefined }}
      >
        {!imageLoaded && (
          <div
            className={cx(
              'w-full h-full flex flex-col justify-center items-center bg-panel-background-toolbar p-8',
              hidePlaceholderOnHover && 'group-hover:opacity-0',
            )}
          >
            <Icon path={mdiAccountTieOutline} size={10} className="opacity-65" />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export default React.memo(CharacterImage);
