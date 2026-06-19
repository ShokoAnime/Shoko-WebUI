import React, { useEffect } from 'react';
import { mdiChevronDown, mdiChevronUp, mdiLoading, mdiMinusCircleOutline, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import prettyBytes from 'pretty-bytes';
import { useImmer } from 'use-immer';
import { useToggle } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/core/toast';
import {
  useReleaseDeletionPreviewMutation,
  useReleaseExecuteMutation,
} from '@/core/react-query/release-management/mutations';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { ReleaseDeletionPreviewType } from '@/core/types/api/release-management';

type Props = {
  open: boolean;
  includedSeriesIDs?: number[];
  excludedSeriesIDs?: number[];
  overrides: Map<number, string>;
  precomputedData?: ReleaseDeletionPreviewType[];
  onClose: () => void;
  onSuccess?: () => void;
};

type SeriesRowProps = {
  preview: ReleaseDeletionPreviewType;
  uncheckedPlaceIDs: Set<number>;
  initialExpanded?: boolean;
  onPlaceToggle: (placeId: number) => void;
  onRemoveSeries: () => void;
};

const SeriesPreviewRow = (
  { initialExpanded = false, onPlaceToggle, onRemoveSeries, preview, uncheckedPlaceIDs }: SeriesRowProps,
) => {
  const [expanded, toggleExpanded] = useToggle(initialExpanded);

  const includedFiles = preview.Files.filter(file => !uncheckedPlaceIDs.has(file.PlaceID));
  const includedSize = includedFiles.reduce((sum, file) => sum + file.FileSize, 0);

  return (
    <div className="flex flex-col rounded-lg border border-panel-border bg-panel-background">
      {/* Clickable header row — toggles the file list */}
      <div
        className="flex cursor-pointer items-center gap-3 p-4 transition-colors"
        onClick={toggleExpanded}
      >
        <div
          onClick={(event) => {
            event.stopPropagation();
            onRemoveSeries();
          }}
          data-tooltip-id="tooltip"
          data-tooltip-content="Remove from Deletion"
        >
          <Icon path={mdiMinusCircleOutline} size={1} className="cursor-pointer text-panel-icon-danger" />
        </div>
        <div className="grow">
          <div className="font-semibold">{preview.SeriesTitle}</div>
          <div className="text-sm opacity-65">
            <span className="font-semibold text-panel-text-danger">{includedFiles.length}</span>{' '}
            {includedFiles.length === 1 ? 'file' : 'files'} to delete
            {' · '}
            {prettyBytes(includedSize, { binary: true })}
          </div>
        </div>
        <Icon path={expanded ? mdiChevronUp : mdiChevronDown} size={0.8333} className="opacity-65" />
      </div>

      {expanded && (
        <div className="flex flex-col gap-1 border-t border-panel-border p-4">
          {preview.Files.map((file) => {
            const fileName = file.AbsolutePath?.split(/[/\\]/).pop() ?? `Place ${file.PlaceID}`;
            const isUnchecked = uncheckedPlaceIDs.has(file.PlaceID);
            return (
              <div key={file.PlaceID} className="flex items-center gap-3 text-sm">
                <Checkbox
                  id={`preview-file-${file.PlaceID}`}
                  isChecked={!isUnchecked}
                  onChange={() => onPlaceToggle(file.PlaceID)}
                  label=""
                />
                <div className="min-w-0 grow">
                  <div className="truncate">{fileName}</div>
                  {file.AbsolutePath == null && <div className="text-xs text-panel-text-warning">Path unavailable</div>}
                </div>
                <span className="shrink-0 opacity-65">
                  {prettyBytes(file.FileSize, { binary: true })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MultipleReleasesPreviewModal = ({
  excludedSeriesIDs,
  includedSeriesIDs,
  onClose,
  onSuccess,
  open,
  overrides,
  precomputedData,
}: Props) => {
  useToggleModalKeybinds(open, 'modal');
  useToggleModalKeybinds(!open, 'primary');

  const previewMutation = useReleaseDeletionPreviewMutation();
  const executeMutation = useReleaseExecuteMutation();

  // Series that have been manually removed from the preview by the user
  const [removedSeriesIDs, setRemovedSeriesIDs] = useImmer<Set<number>>(new Set());
  // Place IDs unchecked by the user (excluded from execute)
  const [uncheckedPlaceIDs, setUncheckedPlaceIDs] = useImmer<Set<number>>(new Set());

  const overridesList = [...overrides.entries()].map(([seriesID, preferredCandidateKey]) => ({
    preferredCandidateKey,
    seriesID,
  }));

  // Trigger preview whenever the modal opens (skip when precomputed data is provided)
  useEffect(() => {
    if (!open) return;

    setRemovedSeriesIDs(new Set());
    setUncheckedPlaceIDs(new Set());

    if (precomputedData) return;

    const body = includedSeriesIDs != null
      ? { includedSeriesIDs, overrides: overridesList }
      : { excludedSeriesIDs, overrides: overridesList };

    previewMutation.mutate(body);
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const previews = precomputedData ?? previewMutation.data ?? [];
  const visiblePreviews = previews.filter(preview => !removedSeriesIDs.has(preview.SeriesID));

  const totalFiles = visiblePreviews.reduce(
    (sum, preview) => sum + preview.Files.filter(file => !uncheckedPlaceIDs.has(file.PlaceID)).length,
    0,
  );
  const totalSize = visiblePreviews.reduce(
    (sum, preview) =>
      sum + preview.Files.filter(
        file => !uncheckedPlaceIDs.has(file.PlaceID),
      ).reduce((ser, file) => ser + file.FileSize, 0),
    0,
  );

  const handleRemoveSeries = (seriesId: number) => {
    setRemovedSeriesIDs((draft) => {
      draft.add(seriesId);
    });
  };

  const handlePlaceToggle = (placeId: number) => {
    setUncheckedPlaceIDs((draft) => {
      if (draft.has(placeId)) draft.delete(placeId);
      else draft.add(placeId);
    });
  };

  const handleConfirm = () => {
    const placeIDs = visiblePreviews.flatMap(
      preview => preview.Files.filter(file => !uncheckedPlaceIDs.has(file.PlaceID)).map(file => file.PlaceID),
    );

    if (placeIDs.length === 0) {
      toast.warning('Nothing to delete', 'No files are selected for deletion.');
      return;
    }

    executeMutation.mutate(
      { placeIDs },
      {
        onSuccess: () => {
          toast.success(
            'Deletion queued',
            `${placeIDs.length} ${placeIDs.length === 1 ? 'file' : 'files'} queued for deletion.`,
          );
          onClose();
          onSuccess?.();
        },
      },
    );
  };

  return (
    <ModalPanel
      show={open}
      size="xl"
      onRequestClose={onClose}
      header="Preview Deletion"
      footer={
        <div className="flex items-center justify-between">
          <div className="text-sm opacity-65">
            {totalFiles > 0
              ? (
                <>
                  <span className="font-semibold text-panel-text-danger">{totalFiles}</span>
                  {` ${totalFiles === 1 ? 'file' : 'files'} · `}
                  <span className="font-semibold">{prettyBytes(totalSize, { binary: true })}</span>
                  {' to free'}
                </>
              )
              : 'No files selected'}
          </div>
          <div className="flex gap-3">
            <Button buttonType="secondary" className="px-6 py-2" onClick={onClose}>
              Cancel
            </Button>
            <Button
              buttonType="danger"
              className="flex items-center gap-x-2 px-6 py-2"
              onClick={handleConfirm}
              loading={executeMutation.isPending}
              disabled={totalFiles === 0}
            >
              <Icon path={mdiTrashCanOutline} size={0.8333} />
              Delete
            </Button>
          </div>
        </div>
      }
      fullHeight
    >
      <div className="flex h-full flex-col gap-4 overflow-y-auto pr-2">
        {!precomputedData && previewMutation.isPending && (
          <div className="flex h-full items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} size={4} spin />
          </div>
        )}

        {!precomputedData && previewMutation.isError && (
          <div className="flex h-full items-center justify-center">
            <span className="text-panel-text-danger">
              Failed to compute preview. Please try again.
            </span>
          </div>
        )}

        {(precomputedData ?? previewMutation.isSuccess) && visiblePreviews.length === 0 && (
          <div className="flex h-full items-center justify-center text-lg font-semibold">
            No files to delete.
          </div>
        )}

        {(precomputedData ?? previewMutation.isSuccess) && visiblePreviews.map(preview => (
          <SeriesPreviewRow
            key={preview.SeriesID}
            preview={preview}
            uncheckedPlaceIDs={uncheckedPlaceIDs}
            initialExpanded={visiblePreviews.length === 1}
            onPlaceToggle={handlePlaceToggle}
            onRemoveSeries={() => handleRemoveSeries(preview.SeriesID)}
          />
        ))}
      </div>
    </ModalPanel>
  );
};

export default MultipleReleasesPreviewModal;
