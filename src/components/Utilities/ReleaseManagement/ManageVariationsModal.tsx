import React, { useState } from 'react';
import { mdiFlagOffOutline, mdiFlagOutline, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import prettyBytes from 'pretty-bytes';
import { useImmer } from 'use-immer';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/core/toast';
import { useMarkVariationMutation } from '@/core/react-query/file/mutations';
import { resetQueries } from '@/core/react-query/queryClient';
import { useMultipleReleaseSeriesDetailQuery } from '@/core/react-query/release-management/queries';
import { buildEpisodeCoverageString } from '@/core/utilities/buildEpisodeCoverageString';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

type Props = {
  open: boolean;
  seriesId: number;
  seriesTitle?: string;
  onClose: () => void;
};

const ManageVariationsModal = ({ onClose, open, seriesId, seriesTitle }: Props) => {
  const [selectedIds, setSelectedIds] = useImmer<Set<number>>(new Set());
  const [isApplying, setIsApplying] = useState(false);
  const { mutateAsync: markVariation } = useMarkVariationMutation();

  useToggleModalKeybinds(open, 'modal');
  useToggleModalKeybinds(!open, 'primary');

  const seriesQuery = useMultipleReleaseSeriesDetailQuery(seriesId, true, open && seriesId > 0);

  const allFiles = (() => {
    if (!seriesQuery.data) return [];
    const seen = new Set<number>();
    return seriesQuery.data.Candidates
      .flatMap(candidate => candidate.Files)
      .filter((file) => {
        if (seen.has(file.VideoLocalID)) return false;
        seen.add(file.VideoLocalID);
        return true;
      });
  })();

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
    setIsApplying(true);
    try {
      await Promise.all(ids.map(fileId => markVariation({ fileId, variation })));
      setSelectedIds(new Set());
      resetQueries(['release-management']);
      toast.success(
        `${variation ? 'Marked' : 'Unmarked'} ${ids.length} file${ids.length !== 1 ? 's' : ''} as variation`,
      );
    } catch {
      toast.error(`Failed to ${variation ? 'mark' : 'unmark'} files as variations`);
    } finally {
      setIsApplying(false);
    }
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    onClose();
  };

  return (
    <ModalPanel
      show={open}
      size="lg"
      onRequestClose={handleClose}
      header={`Manage Variations${seriesTitle ? ` — ${seriesTitle}` : ''}`}
      subHeader={
        <div className="flex items-center gap-3">
          <Checkbox
            id="variation-select-all"
            isChecked={allSelected}
            onChange={handleSelectAll}
            label={allSelected ? 'Deselect all' : 'Select all'}
            labelRight
          />
          <span className="ml-auto text-sm opacity-65">
            {selectedIds.size}
            {' of '}
            {allVideoLocalIds.length}
            {' files selected'}
          </span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button buttonType="secondary" className="px-4 py-2" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            buttonType="secondary"
            className="flex items-center gap-x-2 px-4 py-2 whitespace-nowrap"
            disabled={selectedIds.size === 0 || isApplying}
            loading={isApplying}
            onClick={() => {
              handleMarkVariation(false).catch(console.error);
            }}
          >
            <Icon path={mdiFlagOffOutline} size={0.8333} />
            Unmark as Variations
          </Button>
          <Button
            buttonType="primary"
            className="flex items-center gap-x-2 px-4 py-2 whitespace-nowrap"
            disabled={selectedIds.size === 0 || isApplying}
            loading={isApplying}
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
        <div className="flex h-32 items-center justify-center text-panel-text-primary">
          <Icon path={mdiLoading} size={2} spin />
        </div>
      )}
      {seriesQuery.isSuccess && (
        <div className="flex h-full flex-col gap-2 overflow-y-auto pr-2">
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
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-panel-border bg-panel-background p-3 text-sm"
                onClick={() => handleToggle(file.VideoLocalID)}
              >
                <div
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <Checkbox
                    id={`variation-file-${file.VideoLocalID}`}
                    isChecked={selectedIds.has(file.VideoLocalID)}
                    onChange={() => handleToggle(file.VideoLocalID)}
                    label=""
                  />
                </div>
                <div className="flex min-w-0 grow flex-col gap-1">
                  {dirPath && <div className="truncate text-xs opacity-65">{dirPath}</div>}
                  <div className="truncate font-semibold">{fileName}</div>
                  <div className="flex flex-wrap gap-x-4 text-xs opacity-65">
                    {coverage && <span>{coverage}</span>}
                    <span>{prettyBytes(file.FileSize, { binary: true })}</span>
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
