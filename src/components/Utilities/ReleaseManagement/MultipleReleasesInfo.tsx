import React, { useState } from 'react';
import { mdiFlagOffOutline, mdiFlagOutline, mdiOpenInNew, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import { map } from 'lodash';
import prettyBytes from 'pretty-bytes';

import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';
import Button from '@/components/Input/Button';
import { useDeleteFileMutation, useMarkVariationMutation } from '@/core/react-query/file/mutations';
import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { dayjs } from '@/core/util';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { FileType } from '@/core/types/api/file';

const parseFlag = (flag?: boolean) => {
  if (flag == null) return 'N/A';
  if (flag) return 'Yes';
  return 'No';
};

type Props = {
  file: FileType;
};

const MultipleReleasesInfo = ({ file }: Props) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const managedFoldersQuery = useManagedFoldersQuery();

  const { isPending: markVariationPending, mutate: markVariation } = useMarkVariationMutation();
  const { mutateAsync: deleteFile } = useDeleteFileMutation();

  const handleMarkVariation = (fileId: number, variation: boolean) => {
    markVariation({ fileId, variation }, {
      onSuccess: () => invalidateQueries(['release-management', 'series', 'episodes']),
    });
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    await deleteFile({ fileId: file.ID });
    invalidateQueries(['release-management', 'series', 'episodes']);
  };

  // To re-enable the correct keybinds once the delete confirmation modal closes
  useToggleModalKeybinds(!confirmDelete, 'modal');

  const path = file.Locations[0]?.RelativePath ?? '';
  const match = /[/\\](?=[^/\\]*$)/g.exec(path);
  const relativePath = match ? path?.substring(0, match.index) : 'Root Level';
  const fileName = path?.split(/[/\\]/g).pop();
  const folderName = managedFoldersQuery.data?.find(
    folder => folder.ID === file.Locations[0].ManagedFolderID,
  )?.Name ?? '';
  const importedDate = dayjs(file.Imported);
  const isDeleted = file.Size === -1;

  const audioLanguages = file.MediaInfo?.Audio && file.MediaInfo.Audio.length > 0
    ? map(
      file.MediaInfo.Audio,
      item => item.Language,
    )
      .filter(item => !!item)
      .join(', ')
    : 'N/A';

  const subtitleLanguages = file.MediaInfo?.Subtitles && file.MediaInfo.Subtitles.length > 0
    ? map(
      file.MediaInfo.Subtitles,
      item => item.Language,
    )
      .filter(item => !!item)
      .join(', ')
    : 'N/A';

  return (
    <>
      <div
        className={cx(
          'flex flex-col gap-2 rounded-lg border border-panel-border bg-panel-background-alt p-4 transition-colors',
          file.IsVariation && 'border-panel-text-warning',
          isDeleted && 'opacity-65',
        )}
        data-tooltip-id="tooltip"
        data-tooltip-content={isDeleted ? 'This file is deleted' : ''}
        data-tooltip-place="top"
      >
        <div className="flex items-center justify-between">
          <div
            className="line-clamp-1 flex flex-col"
            data-tooltip-id="tooltip"
            data-tooltip-content={isDeleted ? '' : file.Locations[0].AbsolutePath}
            data-tooltip-delay-show={500}
          >
            <span className="line-clamp-1 truncate text-sm font-semibold opacity-65">
              {folderName}
              &nbsp;-&nbsp;
              {relativePath}
            </span>
            <span className="line-clamp-1 truncate">
              {fileName}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              buttonType="secondary"
              buttonSize="small"
              onClick={() => handleMarkVariation(file.ID, !file.IsVariation)}
              tooltip={isDeleted ? '' : `${file.IsVariation ? 'Unmark' : 'Mark'} as Variation`}
              loading={markVariationPending}
              disabled={isDeleted}
            >
              <Icon path={file.IsVariation ? mdiFlagOffOutline : mdiFlagOutline} size={1} />
            </Button>
            <Button
              buttonType="danger"
              buttonSize="small"
              onClick={() => setConfirmDelete(true)}
              tooltip={isDeleted ? '' : 'Delete'}
              disabled={isDeleted}
            >
              <Icon path={mdiTrashCanOutline} size={1} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 overflow-auto border-t border-panel-border pt-2 text-sm md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="line-clamp-1">
            Group:&nbsp;
            {file.Release?.Group
              ? `${file.Release.Group.Name} (${file.Release.Group.Source})`
              : 'Unknown'}
          </div>

          <div className="line-clamp-1">
            Source:&nbsp;
            {file.Release?.Source ?? 'Unknown'}
          </div>

          <div className="line-clamp-1">
            Version:&nbsp;
            {file.Release?.Version ? `v${file.Release.Version}` : 'v1'}
          </div>

          <div className="line-clamp-1">
            Size:&nbsp;
            {isDeleted ? '-' : prettyBytes(file.Size, { binary: true })}
          </div>

          {file.MediaInfo && (
            <>
              <div className="line-clamp-1">
                Codecs:&nbsp;
                {file.MediaInfo.Video[0].Codec.Simplified}
                &nbsp;|&nbsp;
                {file.MediaInfo.Audio[0].Codec.Simplified}
              </div>

              <div className="line-clamp-1">
                Colour Depth:&nbsp;
                {`${file.MediaInfo.Video[0].BitDepth}-bit`}
              </div>

              <div className="line-clamp-1">
                Resolution:&nbsp;
                {`${file.MediaInfo.Video[0].Width}x${file.MediaInfo.Video[0].Height}`}
              </div>
            </>
          )}

          <div className="line-clamp-1">
            Chaptered:&nbsp;
            {parseFlag(file.Release?.IsChaptered)}
          </div>

          <div className="line-clamp-1">
            Creditless:&nbsp;
            {parseFlag(file.Release?.IsCreditless)}
          </div>

          <div className="line-clamp-1">
            Censored:&nbsp;
            {parseFlag(file.Release?.IsCensored)}
          </div>

          <div className="col-span-1 line-clamp-1 md:col-span-2">
            Imported At:&nbsp;
            {importedDate.isValid()
              ? importedDate.format('MMMM Do, YYYY | HH:mm')
              : 'N/A'}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-y-2 overflow-auto border-t border-panel-border pt-2 text-sm">
          <div
            className="line-clamp-1"
            data-tooltip-id="tooltip"
            data-tooltip-content={audioLanguages !== 'N/A' ? audioLanguages : ''}
          >
            Audio:&nbsp;
            {audioLanguages}
          </div>

          <div className="row-span-2 flex items-center">
            {file.Release?.ReleaseURI?.startsWith('https://anidb.net/file/') && (
              <a
                href={file.Release?.ReleaseURI}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-x-1 font-semibold text-panel-text-primary"
                aria-label="Open AniDB file page"
                onClick={event => event.stopPropagation()}
              >
                <div className="metadata-link-icon AniDB" />
                {file.Release.ReleaseURI.split('/').pop()}
                <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={0.8} />
              </a>
            )}
          </div>

          <div
            className="line-clamp-1"
            data-tooltip-id="tooltip"
            data-tooltip-content={subtitleLanguages !== 'N/A' ? subtitleLanguages : ''}
          >
            Subtitles:&nbsp;
            {subtitleLanguages}
          </div>
        </div>
      </div>

      <ConfirmationPromptModal
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
        show={confirmDelete}
        title="Delete file"
        confirmButtonType="danger"
        confirmText="Delete"
      >
        Do you want to delete the following file?
        <div className="flex flex-col gap-1">
          <div className="text-sm opacity-65">
            {folderName}
            &nbsp;-&nbsp;
            {relativePath}
          </div>
          <div className="text-panel-text-important">
            {fileName}
          </div>
        </div>
      </ConfirmationPromptModal>
    </>
  );
};

export default MultipleReleasesInfo;
