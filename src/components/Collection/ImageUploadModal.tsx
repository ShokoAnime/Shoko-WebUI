import { useEffect, useState } from 'react';
import type { DragEvent } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { mdiImagePlusOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import prettyBytes from 'pretty-bytes';

import Button from '@/components/Input/Button';
import { buttonSizeClasses, buttonTypeClasses } from '@/components/Input/Button.utils';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useUploadGroupImageMutation } from '@/core/react-query/group/mutations';
import { useUploadSeriesImageMutation } from '@/core/react-query/series/mutations';
import toast from '@/core/toast';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { ImageEntityValues } from '@/core/types/api/common';
import type { ImageTabType } from '@/core/types/api/image';

const tabLabelMap: Record<ImageTabType, { label: string, serverType: ImageEntityValues }> = {
  Posters: { label: 'Poster', serverType: 'Primary' },
  Backdrops: { label: 'Backdrop', serverType: 'Backdrop' },
  Logos: { label: 'Logo', serverType: 'Logo' },
};

type ImageUploadModalProps = {
  show: boolean;
  onClose: () => void;
  id: number;
  type: 'series' | 'group';
  imageType: ImageTabType;
};

const ImageUploadModal = ({ id, imageType, onClose, show, type }: ImageUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { label: imageLabel, serverType } = tabLabelMap[imageType];
  const { isPending: isSeriesPending, mutate: uploadSeriesImage } = useUploadSeriesImageMutation();
  const { isPending: isGroupPending, mutate: uploadGroupImage } = useUploadGroupImageMutation();
  const isPending = isSeriesPending || isGroupPending;

  const selectFile = (selectedFile?: File) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Only image files are supported.');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  };

  const handleUpload = () => {
    if (!file || isPending) return;

    if (type === 'series') {
      uploadSeriesImage({ file, imageType: serverType, seriesId: id }, { onSuccess: onClose });
    } else {
      uploadGroupImage({ file, imageType: serverType, groupId: id }, { onSuccess: onClose });
    }
  };

  useToggleModalKeybinds(show, 'modal');
  useToggleModalKeybinds(!show, 'primary');
  useHotkeys('escape', () => !isPending && onClose(), { scopes: 'modal' });
  useHotkeys('enter', handleUpload, { scopes: 'modal' });

  return (
    <ModalPanel
      show={show}
      onRequestClose={isPending ? undefined : onClose}
      onAfterOpen={() => {
        setFile(null);
        setPreviewUrl(null);
      }}
      size="md"
      header={`Upload ${imageLabel}`}
      footer={
        <div className="flex justify-end gap-x-3">
          <Button
            buttonType="secondary"
            buttonSize="normal"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            buttonType="primary"
            buttonSize="normal"
            disabled={!file || isPending}
            loading={isPending}
            onClick={handleUpload}
          >
            Upload
          </Button>
        </div>
      }
    >
      <div
        className={cx(
          'flex flex-col items-center justify-center gap-y-4 rounded-lg border-2 border-dashed p-8 transition-colors',
          isDragging
            ? 'border-panel-text-primary bg-panel-background-overlay'
            : 'border-panel-border',
          file && 'border-solid border-panel-border',
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {file
          ? (
            <>
              <img
                src={previewUrl!}
                alt="Preview"
                className="max-h-96 max-w-full rounded-lg object-contain"
              />
              <div className="text-sm font-bold">
                {file.name} — {prettyBytes(file.size)}
              </div>
            </>
          )
          : (
            <>
              <Icon path={mdiImagePlusOutline} size={2} className="text-panel-text-primary" />
              <p className="text-lg font-semibold">Drag &amp; drop an image here</p>
            </>
          )}

        <div className="font-semibold">or</div>

        <label
          className={cx(
            'cursor-pointer rounded-lg font-semibold transition-colors hover:bg-button-primary-hover',
            buttonTypeClasses.primary,
            buttonSizeClasses.small,
          )}
        >
          Browse
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={event => selectFile(event.target.files?.[0])}
          />
        </label>
      </div>
    </ModalPanel>
  );
};

export default ImageUploadModal;
