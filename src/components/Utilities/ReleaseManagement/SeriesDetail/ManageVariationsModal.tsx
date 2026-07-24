import { useState } from 'react';
import { mdiFlagOffOutline, mdiFlagOutline, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { uniqBy } from 'lodash';
import prettyBytes from 'pretty-bytes';
import { useImmer } from 'use-immer';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useMarkVariationMutation } from '@/core/react-query/file/mutations';
import { resetQueries } from '@/core/react-query/queryClient';
import { useMultipleReleaseSeriesDetailQuery } from '@/core/react-query/release-management/queries';
import toast from '@/core/toast';
import { buildEpisodeCoverageString } from '@/core/utilities/releaseManagementHelpers';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

type Props = {
  show: boolean;
  onClose: () => void;
  seriesId: number;
  seriesTitle?: string;
};

const ManageVariationsModal = ({ onClose, seriesId, seriesTitle, show }: Props) => {
  const [selectedIds, setSelectedIds] = useImmer<Set<number>>(new Set());
  const [markVariationPending, setMarkVariationPending] = useState(false);
  const { mutateAsync: markVariation } = useMarkVariationMutation();

  useToggleModalKeybinds(show, 'modal');
  useToggleModalKeybinds(!show, 'primary');

  const seriesQuery = useMultipleReleaseSeriesDetailQuery(seriesId, true, show && seriesId > 0);

  const allFiles = seriesQuery.data
    ? uniqBy(seriesQuery.data.Candidates.flatMap(candidate => candidate.Files), 'VideoLocalID')
    : [];

  const allVideoLocalIds = allFiles.map(file => file.VideoLocalID);
  const allSelected = allVideoLocalIds.length > 0 && selectedIds.size === allVideoLocalIds.length;

  const handleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(allVideoLocalIds));
  };

  const handleToggle = (videoLocalId: number) => {
    setSelectedIds((draft) => {
      if (draft.has(videoLocalId)) draft.delete(videoLocalId);
      else draft.add(videoLocalId);
    });
  };

  const handleMarkVariation = async (variation: boolean) => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setMarkVariationPending(true);
    try {
      await Promise.all(ids.map(fileId => markVariation({ fileId, variation })));
      resetQueries(['release-management']);
      toast.success(
        `${variation ? 'Marked' : 'Unmarked'} ${ids.length} ${ids.length !== 1 ? 'files' : 'file'} as variation`,
      );
    } catch {
      toast.error(`Failed to ${variation ? 'mark' : 'unmark'} files as variations`);
    }
    setSelectedIds(new Set());
    setMarkVariationPending(false);
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    onClose();
  };

  return (
    <ModalPanel
      show={show}
      size="lg"
      onRequestClose={handleClose}
      header={`Manage Variations${seriesTitle ? `  -  ${seriesTitle}` : ''}`}
      subHeader={
        <div className="flex items-center justify-between gap-3">
          <Checkbox
            id="variation-select-all"
            isChecked={allSelected}
            onChange={handleSelectAll}
            label={allSelected ? 'Deselect all' : 'Select all'}
            labelRight
          />

          <div className="text-sm opacity-65">
            {selectedIds.size}
            &nbsp;of&nbsp;
            {allVideoLocalIds.length}
            {allVideoLocalIds.length > 1 ? ' files' : ' file'}
            &nbsp;selected
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button buttonType="secondary" buttonSize="normal" onClick={handleClose}>
            Cancel
          </Button>

          <Button
            buttonType="secondary"
            buttonSize="normal"
            className="flex items-center gap-x-2"
            disabled={selectedIds.size === 0 || markVariationPending}
            loading={markVariationPending}
            onClick={() => {
              handleMarkVariation(false).catch(console.error);
            }}
          >
            <Icon path={mdiFlagOffOutline} size={0.8333} />
            Unmark as Variations
          </Button>
          <Button
            buttonType="primary"
            buttonSize="normal"
            className="flex items-center gap-x-2"
            disabled={selectedIds.size === 0 || markVariationPending}
            loading={markVariationPending}
            onClick={() => {
              handleMarkVariation(true).catch(console.error);
            }}
          >
            <Icon path={mdiFlagOutline} size={0.8333} />
            Mark as Variations
          </Button>
        </div>
      }
      fullHeight
    >
      {seriesQuery.isPending && (
        <div className="flex h-full items-center justify-center text-panel-text-primary">
          <Icon path={mdiLoading} size={4} spin />
        </div>
      )}

      {seriesQuery.isSuccess && (
        <div className="flex h-full flex-col gap-y-2 overflow-y-auto pr-2">
          {allFiles.map((file) => {
            const lastSlash = Math.max(
              file.AbsolutePath?.lastIndexOf('/') ?? -1,
              file.AbsolutePath?.lastIndexOf('\\') ?? -1,
            );
            const fileName = file.AbsolutePath?.slice(lastSlash + 1) ?? `Place ${file.PlaceID}`;
            const dirPath = file.AbsolutePath && lastSlash > 0
              ? file.AbsolutePath.slice(0, lastSlash)
              : null;
            const coverage = buildEpisodeCoverageString(file.Episodes);

            return (
              <div
                key={file.PlaceID}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-panel-border p-3 text-sm odd:bg-panel-background even:bg-panel-background-alt"
                onClick={() => handleToggle(file.VideoLocalID)}
              >
                <Checkbox
                  id={`variation-file-${file.VideoLocalID}`}
                  isChecked={selectedIds.has(file.VideoLocalID)}
                  onChange={() => handleToggle(file.VideoLocalID)}
                  label=""
                />

                <div className="flex min-w-0 grow flex-col gap-1">
                  {dirPath && (
                    <div
                      className="truncate text-xs opacity-65"
                      data-tooltip-id="tooltip"
                      data-tooltip-content={dirPath}
                    >
                      {dirPath}
                    </div>
                  )}

                  <div className="truncate font-semibold" data-tooltip-id="tooltip" data-tooltip-content={fileName}>
                    {fileName}
                  </div>

                  <div className="flex flex-wrap gap-x-4 text-xs opacity-65">
                    {coverage && <span>{coverage}</span>}
                    {prettyBytes(file.FileSize, { binary: true })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ModalPanel>
  );
};

export default ManageVariationsModal;
