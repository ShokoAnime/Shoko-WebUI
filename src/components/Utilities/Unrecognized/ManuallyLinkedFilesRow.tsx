import React, { useCallback, useEffect, useState } from 'react';
import { mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { find, forEach, toNumber } from 'lodash';

import { useRowSelection } from '@/hooks/useRowSelection';

import type { EpisodeType } from '@/core/types/api/episode';
import type { FileType } from '@/core/types/api/file';

type Props = {
  updateSelectedFiles: (fileIds: number[], select?: boolean) => void;
  selectedFiles: Record<number, boolean>;
  files: FileType[];
  episodes: EpisodeType[];
};

const episodePrefixMap = {
  Normal: 'EP',
  Special: 'SP',
  ThemeSong: 'C',
};

function ManuallyLinkedFilesRow(props: Props) {
  const {
    episodes,
    files,
    selectedFiles,
    updateSelectedFiles,
  } = props;

  const {
    handleRowSelect,
    rowSelection,
    setRowSelection,
  } = useRowSelection<FileType>(files);

  useEffect(() => {
    forEach(rowSelection, (value, key) => {
      updateSelectedFiles([toNumber(key)], value);
    });
  }, [rowSelection, updateSelectedFiles]);

  useEffect(() => {
    if (Object.keys(selectedFiles).length === 0) setRowSelection({});
  }, [selectedFiles, setRowSelection]);

  const [lastRowSelected, setLastRowSelected] = useState<number | null>(null);
  const handleSelect = useCallback((event: React.MouseEvent, index: number) => {
    if (event.shiftKey) {
      window?.getSelection()?.removeAllRanges();
      const lrIndex = lastRowSelected ?? index;
      const fromIndex = Math.min(lrIndex, index);
      const toIndex = Math.max(lrIndex, index);
      const isSelected = lastRowSelected !== null
        ? rowSelection[files[lastRowSelected].ID]
        : true;
      const tempRowSelection: Record<number, boolean> = {};
      for (let i = fromIndex; i <= toIndex; i += 1) {
        const id = files[i].ID;
        tempRowSelection[id] = isSelected;
      }
      setRowSelection(tempRowSelection);
    } else if (window?.getSelection()?.type !== 'Range') {
      const id = files[index].ID;
      handleRowSelect(id, !rowSelection[id]);
      setLastRowSelected(index);
    }
  }, [files, handleRowSelect, lastRowSelected, rowSelection, setRowSelection]);

  return (
    <div className="mt-4 flex flex-col">
      <div className="flex rounded-md border border-panel-border bg-panel-background-alt p-4 font-semibold">
        <div className="line-clamp-1 w-1/2 overflow-hidden px-2">
          Entry
        </div>
        <div className="line-clamp-1 w-1/2 overflow-hidden px-2">
          File
        </div>
      </div>
      {files.map((file, index) => {
        const episode = find(episodes, item => item.IDs.ID === file.SeriesIDs![0].EpisodeIDs[0].ID)!;
        const selected = rowSelection[file.ID];

        return (
          <div className="mt-2 rounded-md" key={file.ID}>
            <div
              className={cx(
                'bg-panel-background flex relative cursor-pointer rounded-md border p-4 text-left transition-colors',
                selected ? 'border-panel-text-primary' : 'border-panel-border',
                'border-panel-border',
              )}
              onClick={event => handleSelect(event, index)}
            >
              <div className="line-clamp-1 w-1/2 overflow-hidden px-2">
                <div className="flex">
                  {`${
                    episodePrefixMap[episode?.AniDB?.Type ?? ''] ?? ''
                  } ${episode?.AniDB?.EpisodeNumber} - ${episode?.Name}`}
                  &nbsp;(
                  <span className="font-semibold text-panel-text-primary">{episode?.IDs?.AniDB}</span>
                  )
                  <a
                    href={`https://anidb.net/episode/${episode?.IDs?.AniDB}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="ml-2 text-panel-text-primary"
                    aria-label="Open AniDB episode page"
                    onClick={e => e.stopPropagation()}
                  >
                    <Icon path={mdiOpenInNew} size={1} />
                  </a>
                </div>
              </div>
              <div className="line-clamp-1 w-1/2 overflow-hidden px-2">
                {file.Locations?.[0].RelativePath.split(/[/\\]/g).pop() ?? '<missing file path>'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ManuallyLinkedFilesRow;
