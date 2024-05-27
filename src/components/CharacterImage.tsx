import React, { useState } from 'react';
import { mdiAccountTieOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

type Props = {
  className?: string;
  imageSrc: string | null;
  hidePlaceholderOnHover?: boolean;
};

const LoadingElement = React.memo(({ hidePlaceholderOnHover }: { hidePlaceholderOnHover?: boolean }) => (
  <div
    className={cx(
      'w-full h-full flex flex-col justify-center items-center bg-panel-input p-6',
      hidePlaceholderOnHover && 'group-hover:opacity-0',
    )}
  >
    <Icon path={mdiAccountTieOutline} size={10} className="opacity-65" />
  </div>
));

const CharacterImage = React.memo((props: Props) => {
  const {
    className,
    hidePlaceholderOnHover,
    imageSrc,
  } = props;

  const [imageLoaded, setImageLoaded] = useState(false);

  const backgroundImage = new Image();
  if (imageSrc) {
    backgroundImage.onload = () => setImageLoaded(true);
    backgroundImage.src = imageSrc;
  }

  return (
    <div className={`${className} overflow-hidden`}>
      {!imageSrc
        ? <LoadingElement hidePlaceholderOnHover={hidePlaceholderOnHover} />
        : (
          <div
            className="group absolute left-0 top-0 z-[-1] flex size-full flex-col text-center"
            style={{ background: imageLoaded ? `50% 0% / cover no-repeat url('${backgroundImage.src}')` : undefined }}
          >
            {!imageLoaded && <LoadingElement hidePlaceholderOnHover={hidePlaceholderOnHover} />}
          </div>
        )}
    </div>
  );
});

export default CharacterImage;
