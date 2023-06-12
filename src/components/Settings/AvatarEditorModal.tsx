import React, { useEffect, useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { Icon } from '@mdi/react';
import { mdiImageMinusOutline, mdiImagePlusOutline } from '@mdi/js';

import ModalPanel from '@/components/Panels/ModalPanel';
import Button from '@/components/Input/Button';
import toast from '@/components/Toast';

type Props = {
  show: boolean;
  onClose: () => void;
  image: File | undefined;
  changeAvatar: (avatar: string) => void;
};

const AvatarEditorModal = (props: Props) => {
  const { show, onClose, image, changeAvatar } = props;

  const imageEditor = useRef<AvatarEditor>(null);
  const [scale, setScale] = useState(1);

  const onLoadFailure = () => {
    toast.error('Image load failed!');
    onClose();
  };

  useEffect(() => {
    if (show) setScale(1);
  }, [show]);

  const handleSave = () => {
    const canvas: HTMLCanvasElement = imageEditor.current?.getImage();

    if (canvas.width > 512) {
      const resizedCanvas = document.createElement('canvas');
      const resizedCanvasContext = resizedCanvas.getContext('2d');
      resizedCanvas.width = 512;
      resizedCanvas.height = 512;
      resizedCanvasContext?.drawImage(canvas, 0, 0, 512, 512);
      changeAvatar(resizedCanvas.toDataURL('image/webp'));
    } else {
      changeAvatar(canvas.toDataURL('image/webp'));
    }

    onClose();
  };

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      className="p-8 flex-col drop-shadow-lg gap-y-8 !w-96"
    >
      <div className="flex font-semibold text-xl">Avatar</div>
      <AvatarEditor
        image={image}
        width={256}
        height={256}
        borderRadius={9999}
        scale={scale}
        className="self-center bg-background-border h-auto w-full"
        onLoadFailure={onLoadFailure}
        ref={imageEditor}
      />
      <div className="flex gap-x-4 items-center">
        <Icon path={mdiImageMinusOutline} size={0.9} />
        <input
          name="scale"
          type="range"
          min="0.01"
          max="2"
          step="0.01"
          value={scale}
          onChange={e => setScale(Number(e.target.value))}
          className="grow"
        />
        <Icon path={mdiImagePlusOutline} size={1.2} />
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} className="bg-background-nav px-6 py-2 text-font-main">Cancel</Button>
        <Button onClick={handleSave} className="bg-highlight-1 px-6 py-2">Apply</Button>
      </div>
    </ModalPanel>
  );
};

export default AvatarEditorModal;
