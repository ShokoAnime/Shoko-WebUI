import { useState } from 'react';
import { mdiImagePlusOutline, mdiLoading, mdiStarCircleOutline, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { useToggle } from 'usehooks-ts';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import ImageUploadModal from '@/components/Collection/ImageUploadModal';
import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';
import Button from '@/components/Input/Button';
import { useSetGroupDefaultImageMutation, useUnsetGroupDefaultImageMutation } from '@/core/react-query/group/mutations';
import { useGroupImagesQuery } from '@/core/react-query/group/queries';
import { useDeleteImageMutation } from '@/core/react-query/image-management/mutations';
import toast from '@/core/toast';

import type { ImageType } from '@/core/types/api/common';

type Props = {
  groupId: number;
};

const posterSize = { width: 10, height: 15 }; // rem, 2:3 poster ratio

const ImagesTab = ({ groupId }: Props) => {
  const imagesQuery = useGroupImagesQuery(groupId);

  const [showUploadModal, toggleUploadModal] = useToggle(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);

  const { mutate: setPreferred } = useSetGroupDefaultImageMutation(groupId);
  const { mutate: unsetPreferred } = useUnsetGroupDefaultImageMutation(groupId);
  const { mutateAsync: deleteImage } = useDeleteImageMutation();

  const handleSelectionChange = (item: ImageType) => {
    setSelectedImage(prev => (prev?.UID === item.UID ? null : item));
  };

  const handleTogglePreferredImage = () => {
    if (!selectedImage) return;
    if (selectedImage.Preferred) {
      unsetPreferred(undefined, {
        onSuccess: () => {
          toast.success('Preferred poster has been unset.');
          setSelectedImage(null);
        },
      });
    } else {
      setPreferred(selectedImage.UID, {
        onSuccess: () => {
          toast.success('Preferred poster has been set.');
          setSelectedImage(null);
        },
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedImage) return;
    try {
      await deleteImage(selectedImage.UID);
      toast.success('Poster deleted.');
    } catch (error) {
      console.error(error);
    }
    setSelectedImage(null);
  };

  return (
    <div className="flex h-full flex-col gap-y-4">
      {imagesQuery.isError && (
        <div className="m-auto text-lg font-semibold text-panel-text-danger">
          Group images could not be loaded!
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">
          Posters |&nbsp;
          <span className="text-panel-text-important">{imagesQuery.data?.length ?? '-'}</span>
          &nbsp;Listed
        </div>
        <div className="flex items-center gap-x-3">
          <Button
            className="text-panel-text-primary"
            onClick={toggleUploadModal}
            tooltip="Upload Poster"
          >
            <Icon path={mdiImagePlusOutline} size={1} />
          </Button>
          <Button
            disabled={!selectedImage}
            className={selectedImage?.Preferred ? 'text-panel-text-important' : undefined}
            onClick={handleTogglePreferredImage}
            tooltip={selectedImage?.Preferred ? 'Unset Preferred Poster' : 'Set As Preferred Poster'}
          >
            <Icon path={mdiStarCircleOutline} size={1} />
          </Button>
          <Button
            disabled={!selectedImage || selectedImage.Source !== 'User'}
            className="text-panel-text-danger"
            onClick={() => setShowDeleteConfirm(true)}
            tooltip={selectedImage && selectedImage.Source !== 'User'
              ? 'Only user-uploaded images can be deleted'
              : 'Delete Poster'}
          >
            <Icon path={mdiTrashCanOutline} size={1} />
          </Button>
        </div>
      </div>

      <div className="grow overflow-y-auto">
        {imagesQuery.isPending && (
          <div className="flex h-full items-center justify-center py-6">
            <Icon path={mdiLoading} size={4} spin className="text-panel-text-primary" />
          </div>
        )}

        {imagesQuery.isSuccess && imagesQuery.data.length === 0 && (
          <div className="flex h-full items-center justify-center font-semibold">
            No posters found for this group.
          </div>
        )}

        {imagesQuery.isSuccess && (
          <div className="flex flex-wrap justify-center gap-3">
            {imagesQuery.data.map(poster => (
              <div
                key={poster.UID}
                onClick={() => handleSelectionChange(poster)}
                className="group flex cursor-pointer items-center justify-center"
                style={{ width: `${posterSize.width}rem`, height: `${posterSize.height}rem` }}
              >
                <BackgroundImagePlaceholderDiv
                  image={poster}
                  className={cx(
                    'size-full rounded-lg drop-shadow-md',
                    poster.UID === selectedImage?.UID
                      ? 'border-4 border-panel-text-important'
                      : 'border-2 border-panel-border',
                  )}
                  linkToImage
                  zoomOnHover
                >
                  {poster.Preferred && (
                    <div
                      className="absolute top-0 right-0 z-10 rounded-bl-lg bg-panel-background-overlay p-2 text-panel-text-important"
                      data-tooltip-id="tooltip"
                      data-tooltip-content="Preferred"
                    >
                      <Icon path={mdiStarCircleOutline} size={1} />
                    </div>
                  )}
                </BackgroundImagePlaceholderDiv>
              </div>
            ))}
          </div>
        )}
      </div>

      <ImageUploadModal
        show={showUploadModal}
        onClose={toggleUploadModal}
        id={groupId}
        type="group"
        imageType="Posters"
      />

      <ConfirmationPromptModal
        show={showDeleteConfirm}
        title="Delete Poster"
        onConfirm={handleDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        confirmText="Delete"
        confirmButtonType="danger"
      >
        Are you sure? This purges the image everywhere it is used.
      </ConfirmationPromptModal>
    </div>
  );
};

export default ImagesTab;
