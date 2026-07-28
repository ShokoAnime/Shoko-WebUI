import { useEffect } from 'react';
import AnimateHeight from 'react-animate-height';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSearchParams } from 'react-router';
import { mdiChevronDown, mdiLoading, mdiMinusCircleOutline, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { filter } from 'lodash';
import prettyBytes from 'pretty-bytes';
import { useImmer } from 'use-immer';
import { useToggle } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import { resetQueries } from '@/core/react-query/queryClient';
import { useReleaseDeleteMutation } from '@/core/react-query/release-management/mutations';
import {
  useReleaseDeletionPreviewQuery,
  useReleaseMixMatchDeletionPreviewQuery,
} from '@/core/react-query/release-management/queries';
import toast from '@/core/toast';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { ReleaseDeletionPreviewType } from '@/core/types/api/release-management';

type Props = {
  show: boolean;
  onClose: () => void;
  allSelected?: boolean;
  selectedSeries?: number[];
  primaryCandidateKey?: string;
  mixMatchSelection?: number[];
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
    <div className="flex flex-col rounded-lg border border-panel-border bg-panel-background-alt">
      {/* Clickable header row  -  toggles the file list */}
      <div
        className="flex cursor-pointer items-center gap-x-3 p-4"
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

        <div className="flex grow flex-col truncate">
          <div
            className="truncate font-semibold"
            data-tooltip-id="tooltip"
            data-tooltip-content={preview.SeriesTitle}
          >
            {preview.SeriesTitle}
          </div>

          <div className="text-sm font-semibold opacity-65">
            <span className="font-semibold text-panel-text-danger">{includedFiles.length}</span>
            {includedFiles.length === 1 ? ' file' : ' files'} to delete,&nbsp;
            {prettyBytes(includedSize, { binary: true })}
          </div>
        </div>

        <Icon
          path={mdiChevronDown}
          size={0.8333}
          rotate={expanded ? -180 : 0}
          className="shrink-0 transition-transform"
        />
      </div>

      <AnimateHeight height={expanded ? 'auto' : 0}>
        {expanded && (
          <div className="flex flex-col gap-y-1 border-t border-panel-border p-4">
            {preview.Files.map((file) => {
              const pathParts = file.AbsolutePath?.split(/[/\\]/) ?? [];
              const fileName = pathParts.at(-1) ?? `Place ${file.PlaceID}`;
              const dirPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : null;
              const isUnchecked = uncheckedPlaceIDs.has(file.PlaceID);

              return (
                <div key={file.PlaceID} className="flex items-center gap-x-3 text-sm">
                  <Checkbox
                    id={`preview-file-${file.PlaceID}`}
                    isChecked={!isUnchecked}
                    onChange={() => onPlaceToggle(file.PlaceID)}
                  />

                  <div className="flex grow flex-col gap-y-1 truncate">
                    <div
                      className={cx('truncate text-xs opacity-65', !dirPath && 'text-panel-text-warning')}
                      data-tooltip-id="tooltip"
                      data-tooltip-content={dirPath ?? ''}
                    >
                      {dirPath ?? 'Path unavailable'}
                    </div>
                    <div className="truncate font-semibold" data-tooltip-id="tooltip" data-tooltip-content={fileName}>
                      {fileName}
                    </div>
                  </div>

                  <div className="shrink-0 text-xs opacity-65">
                    {prettyBytes(file.FileSize, { binary: true })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AnimateHeight>
    </div>
  );
};

const ReleaseManagementPreviewModal = ({
  allSelected,
  mixMatchSelection,
  onClose,
  primaryCandidateKey,
  selectedSeries,
  show,
}: Props) => {
  useToggleModalKeybinds(show, 'modal');
  useToggleModalKeybinds(!show, 'primary');
  useHotkeys('escape', () => show && onClose(), { scopes: 'modal' });

  const [searchParams] = useSearchParams();
  const onlyFinishedSeries = searchParams.get('onlyFinishedSeries') === 'true';
  const includeVariations = searchParams.get('includeVariations') === 'true';

  const { isPending: isDeletePending, mutate: deleteReleases } = useReleaseDeleteMutation();

  const previewQuery = useReleaseDeletionPreviewQuery(
    {
      includedSeriesIDs: allSelected ? undefined : selectedSeries,
      excludedSeriesIDs: allSelected ? selectedSeries : undefined,
      overrides: (primaryCandidateKey && selectedSeries?.[0])
        ? [{ preferredCandidateKey: primaryCandidateKey, seriesID: selectedSeries[0] }]
        : undefined,
    },
    onlyFinishedSeries,
    includeVariations,
    show && !mixMatchSelection,
  );

  // Mix & Match always fetches with includeVariations=true, so a selection may legitimately
  // include a variation's PlaceID - this must match or the endpoint 400s on an "unknown" ID.
  const mixMatchPreviewQuery = useReleaseMixMatchDeletionPreviewQuery(
    selectedSeries?.[0] ?? 0,
    { selectedPlaceIDs: mixMatchSelection ?? [] },
    true,
    show && !!mixMatchSelection && !!selectedSeries,
  );
  const mixMatchPreviewData = mixMatchPreviewQuery.data ? [mixMatchPreviewQuery.data] : undefined;

  const queryPending = mixMatchSelection ? mixMatchPreviewQuery.isPending : previewQuery.isPending;
  const querySuccess = mixMatchSelection ? mixMatchPreviewQuery.isSuccess : previewQuery.isSuccess;

  // Series that have been manually removed from the preview by the user
  const [removedSeriesIDs, setRemovedSeriesIDs] = useImmer<Set<number>>(new Set());
  // Place IDs unchecked by the user (excluded from execute)
  const [uncheckedPlaceIDs, setUncheckedPlaceIDs] = useImmer<Set<number>>(new Set());

  useEffect(() => {
    setRemovedSeriesIDs(new Set());
    setUncheckedPlaceIDs(new Set());
  }, [show, setRemovedSeriesIDs, setUncheckedPlaceIDs]);

  const visiblePreviews = filter(
    mixMatchSelection ? mixMatchPreviewData : previewQuery.data,
    preview => !removedSeriesIDs.has(preview.SeriesID),
  );

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
    setRemovedSeriesIDs(draft => draft.add(seriesId));
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
      return;
    }

    deleteReleases(
      { placeIDs },
      {
        onSuccess: () => {
          toast.success(
            'Deletion queued',
            `${placeIDs.length} ${placeIDs.length === 1 ? 'file' : 'files'} queued for deletion.`,
          );
          onClose();
          resetQueries(['release-management']);
        },
      },
    );
  };

  return (
    <ModalPanel
      show={show}
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
                  {` ${totalFiles === 1 ? 'file' : 'files'}, `}
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
              loading={isDeletePending}
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
      <div className="flex h-full flex-col gap-y-2 overflow-y-auto pr-2">
        {queryPending && (
          <div className="flex h-full items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} size={4} spin />
          </div>
        )}

        {querySuccess && visiblePreviews.length === 0 && (
          <div className="flex h-full items-center justify-center text-lg font-semibold">
            No files to delete.
          </div>
        )}

        {querySuccess && visiblePreviews.map(preview => (
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

export default ReleaseManagementPreviewModal;
