import React, { useEffect, useState } from 'react';
import AvatarEditor, { useAvatarEditor } from 'react-avatar-editor';
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

  const imageEditor = useAvatarEditor();
  const [scale, setScale] = useState(1);

  const onLoadFailure = () => {
    toast.error('Image load failed!');
    onClose();
  };

  useEffect(() => {
    if (show) setScale(1);
  }, [show]);

  const handleSave = () => {
    const canvas = imageEditor.getImageScaledToCanvas();
    if (!canvas) return;

    changeAvatar(canvas.toDataURL('image/webp'));
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
      <div className="flex justify-center">
        <AvatarEditor
          image={image}
          width={256}
          height={256}
          borderRadius={9999}
          scale={scale}
          onLoadFailure={onLoadFailure}
          ref={imageEditor.ref}
        />
      </div>
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
