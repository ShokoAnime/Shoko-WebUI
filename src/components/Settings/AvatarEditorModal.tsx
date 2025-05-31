import React, { useEffect, useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { mdiImageMinusOutline, mdiImagePlusOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';

type Props = {
  show: boolean;
  onClose: () => void;
  image: File | undefined;
  changeAvatar: (avatar: string) => void;
};

const AvatarEditorModal = (props: Props) => {
  const { changeAvatar, image, onClose, show } = props;

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
    if (!imageEditor.current) return;
    const canvas: HTMLCanvasElement = imageEditor.current.getImage();

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

  if (!image) return null;

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      size="sm"
      header="Avatar"
    >
      <AvatarEditor
        image={image}
        width={256}
        height={256}
        borderRadius={9999}
        scale={scale}
        className="h-auto w-full self-center rounded-sm bg-panel-background"
        onLoadFailure={onLoadFailure}
        ref={imageEditor}
      />
      <div className="flex items-center gap-x-4">
        <Icon path={mdiImageMinusOutline} size={0.9} />
        <input
          name="scale"
          type="range"
          min="0.01"
          max="2"
          step="0.01"
          value={scale}
          onChange={event => setScale(Number(event.target.value))}
          className="grow"
        />
        <Icon path={mdiImagePlusOutline} size={1.2} />
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-6 py-2">Cancel</Button>
        <Button onClick={handleSave} buttonType="primary" className="px-6 py-2">Apply</Button>
      </div>
    </ModalPanel>
  );
};

export default AvatarEditorModal;
