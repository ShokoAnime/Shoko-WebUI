import { useMemo, useState } from 'react';
import { useOutletContext, useParams } from 'react-router';
import useMeasure from 'react-use-measure';
import { mdiImagePlusOutline, mdiLoading, mdiStarCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { capitalize, debounce } from 'lodash';
import { useToggle } from 'usehooks-ts';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import ImageUploadModal from '@/components/Collection/Series/ImageUploadModal';
import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';
import Button from '@/components/Input/Button';
import MultiStateButton from '@/components/Input/MultiStateButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import {
  useDeleteImageMutation,
  useSetPreferredImageMutation,
  useUnsetPreferredImageMutation,
} from '@/core/react-query/image-management/mutations';
import { useSeriesImageCrossReferencesQuery } from '@/core/react-query/image-management/queries';
import { invalidateQueries } from '@/core/react-query/queryClient';
import toast from '@/core/toast';
import { pxPerRem } from '@/core/util';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { SeriesContextType } from '@/components/Collection/constants';
import type { ImageCrossReferenceType, ImageTabType } from '@/core/types/api/image';

const tabToImageTypeMap: Record<ImageTabType, string> = {
  Posters: 'Primary',
  Backdrops: 'Backdrop',
  Logos: 'Logo',
};

const tabStates = [
  { value: 'Posters' as const },
  { value: 'Backdrops' as const },
  { value: 'Logos' as const },
];

const InfoLine = ({ title, value }: { title: string, value: string }) => (
  <div className="flex w-full flex-col gap-y-1">
    <span className="font-semibold text-panel-text">{title}</span>
    <span className="line-clamp-1" title={value}>{value}</span>
  </div>
);

const imageItemSize: Record<ImageTabType, { height: number, width: number }> = {
  Posters: { width: 13, height: 19.5 },
  Backdrops: { width: 27, height: 16 },
  Logos: { width: 15, height: 15 },
};

const itemGap = 1; // rem

const SeriesImages = () => {
  const { imageType } = useParams();
  const { scrollRef, series } = useOutletContext<SeriesContextType>();
  const navigate = useNavigateVoid();

  const tabType = (capitalize(imageType) ?? 'Posters') as ImageTabType;

  const { fetchNextPage, isFetchingNextPage, ...crossReferencesQuery } = useSeriesImageCrossReferencesQuery(
    series.IDs.ID,
    { imageType: tabToImageTypeMap[tabType], isAvailable: true, pageSize: 30 },
    !!series.IDs.ID,
  );

  const [images, imagesTotal] = useFlattenListResult(crossReferencesQuery.data);

  const [selectedImage, setSelectedImage] = useState<ImageCrossReferenceType | null>(null);
  const imageLabel = tabType.slice(0, -1);

  const { mutate: setPreferred } = useSetPreferredImageMutation();
  const { mutate: unsetPreferred } = useUnsetPreferredImageMutation();
  const { mutateAsync: deleteImage } = useDeleteImageMutation();
  const [showUploadModal, toggleUploadModal] = useToggle(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSelectionChange = (item: ImageCrossReferenceType) => {
    setSelectedImage(prev => (prev?.ID === item.ID ? null : item));
  };

  const handleTogglePreferredImage = () => {
    if (!selectedImage) return;
    const isPreferred = selectedImage.IsPreferred;
    const mutate = isPreferred ? unsetPreferred : setPreferred;
    const action = isPreferred ? 'unset' : 'set';
    mutate(selectedImage.ID, {
      onSuccess: () => {
        invalidateQueries(['series']);
        toast.success(`Preferred ${imageLabel} has been ${action}.`);
        setSelectedImage(null);
      },
      onError: () => toast.error(`Failed to ${action} preferred ${imageLabel}.`),
    });
  };

  const handleDeleteImage = async () => {
    if (!selectedImage) return;
    await deleteImage(selectedImage.ImageID, {
      onSuccess: () => toast.success(`${imageLabel} deleted.`),
      onError: () => toast.error(`Failed to delete ${imageLabel.toLowerCase()}.`),
    });
  };

  const handleTabChange = (newType: ImageTabType) => {
    setSelectedImage(null);
    navigate(`../images/${newType.toLowerCase()}`);
  };

  const [gridContainerRef, gridContainerBounds] = useMeasure();

  const { height: itemHeight, width: itemWidth } = imageItemSize[tabType];

  const itemsPerRow = Math.max(
    1,
    Math.floor((gridContainerBounds.width / pxPerRem + itemGap) / (itemWidth + itemGap)),
  );
  const rowCount = Math.ceil(imagesTotal / itemsPerRow);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => (itemHeight + itemGap) * pxPerRem,
    overscan: 4,
    gap: 24,
  });

  const fetchNextPageDebounced = useMemo(
    () =>
      debounce(() => {
        fetchNextPage().catch(console.error);
      }, 50),
    [fetchNextPage],
  );

  return (
    <>
      <title>{`${series.Name} > Images | Shoko`}</title>
      <div className="flex w-full gap-x-6">
        <div className="flex w-100 min-w-64 flex-col">
          <ShokoPanel
            title="Selected Image Info"
            contentClassName="gap-y-6"
            fullHeight={false}
            transparent
            sticky
          >
            <InfoLine
              title="Source"
              value={selectedImage?.Image?.Source ?? selectedImage?.ImageSource ?? '-'}
            />
            <InfoLine
              title="Size"
              value={selectedImage?.Image?.Width && selectedImage?.Image?.Height
                ? `${selectedImage.Image.Width} x ${selectedImage.Image.Height}`
                : '-'}
            />
            <Button
              buttonType="primary"
              buttonSize="normal"
              disabled={!selectedImage}
              onClick={handleTogglePreferredImage}
            >
              {selectedImage?.IsPreferred
                ? `Unset Preferred ${imageLabel}`
                : `Set As Preferred ${imageLabel}`}
            </Button>
            <Button
              buttonType="danger"
              buttonSize="normal"
              disabled={!selectedImage || selectedImage.ImageSource !== 'User'}
              tooltip={selectedImage && selectedImage.ImageSource !== 'User'
                ? 'Only user-uploaded images can be deleted'
                : ''}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete {imageLabel}
            </Button>
          </ShokoPanel>
        </div>
        <div className="flex grow flex-col gap-y-6">
          <div className="flex h-24.5 shrink-0 items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent p-6">
            <div className="text-xl font-semibold">
              Images |&nbsp;
              <span className="text-panel-text-important">{imagesTotal || '-'}</span>
              &nbsp;
              {tabType}
              &nbsp;Listed
            </div>
            <div className="flex gap-x-6">
              <Button
                buttonType="primary"
                buttonSize="normal"
                onClick={toggleUploadModal}
              >
                <div className="flex items-center gap-x-2">
                  <Icon path={mdiImagePlusOutline} size={1} />
                  Upload Image
                </div>
              </Button>
              <MultiStateButton activeState={tabType} onStateChange={handleTabChange} states={tabStates} />
            </div>
          </div>
          <div className="rounded-lg border border-panel-border bg-panel-background-transparent p-6">
            <div className="relative" style={{ height: virtualizer.getTotalSize() }} ref={gridContainerRef}>
              {virtualizer.getVirtualItems().map(virtualRow => (
                <div
                  key={virtualRow.key}
                  ref={virtualizer.measureElement}
                  data-index={virtualRow.index}
                  className="absolute top-0 left-0 flex w-full items-center justify-center gap-x-6"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  {Array.from({ length: itemsPerRow }).map((_, colIndex) => {
                    const index = virtualRow.index * itemsPerRow + colIndex;
                    const xref = images[index];
                    const isPlaceholder = index >= imagesTotal;

                    if (isPlaceholder) {
                      return (
                        <div
                          key={`placeholder-${index}`}
                          style={{ width: `${itemWidth}rem`, height: `${itemHeight}rem` }}
                        />
                      );
                    }

                    if (!xref) {
                      if (!isFetchingNextPage) {
                        fetchNextPageDebounced();
                      }
                      return (
                        <div
                          key={`loading-${index}`}
                          className="flex shrink-0 items-center justify-center rounded-lg border border-panel-border text-panel-text-primary"
                          style={{
                            width: `${itemWidth}rem`,
                            height: `${itemHeight}rem`,
                          }}
                        >
                          <Icon path={mdiLoading} spin size={2} />
                        </div>
                      );
                    }

                    return (
                      <div
                        onClick={() => handleSelectionChange(xref)}
                        key={xref.ID}
                        className="group flex cursor-pointer items-center justify-between"
                        style={{ width: `${itemWidth}rem`, height: `${itemHeight}rem` }}
                      >
                        <BackgroundImagePlaceholderDiv
                          image={xref.Image}
                          contain={tabType === 'Logos'}
                          className={cx(
                            'size-full rounded-lg drop-shadow-md',
                            xref === selectedImage
                              ? 'border-4 border-panel-text-important'
                              : 'border-2 border-panel-border',
                          )}
                          linkToImage
                          zoomOnHover
                          overlayOnHover
                        >
                          {xref.IsPreferred && (
                            <div className="absolute top-0 right-0 rounded-bl-lg bg-panel-background-overlay p-2 text-panel-text-important opacity-100 transition-opacity group-hover:opacity-0">
                              <Icon path={mdiStarCircleOutline} size={1} />
                            </div>
                          )}
                        </BackgroundImagePlaceholderDiv>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ImageUploadModal
        show={showUploadModal}
        onClose={toggleUploadModal}
        seriesId={series.IDs.ID}
        imageType={tabType}
      />
      <ConfirmationPromptModal
        show={showDeleteConfirm}
        title={`Delete ${imageLabel}`}
        onConfirm={handleDeleteImage}
        onClose={() => setShowDeleteConfirm(false)}
        confirmText="Delete"
        confirmButtonType="danger"
      >
        {`Are you sure you want to delete this ${imageLabel.toLowerCase()}?`}
      </ConfirmationPromptModal>
    </>
  );
};

export default SeriesImages;
