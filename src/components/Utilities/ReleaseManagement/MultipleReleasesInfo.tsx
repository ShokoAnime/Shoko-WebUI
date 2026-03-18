import React from 'react';
import { mdiFlagOffOutline, mdiFlagOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';
import { produce } from 'immer';
import { map } from 'lodash';
import prettyBytes from 'pretty-bytes';
import { useToggle } from 'usehooks-ts';

import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';
import Button from '@/components/Input/Button';
import { useDeleteFileMutation, useMarkVariationMutation } from '@/core/react-query/file/mutations';
import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import queryClient from '@/core/react-query/queryClient';
import { dayjs } from '@/core/util';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { ListResultType } from '@/core/types/api';
import type { EpisodeType } from '@/core/types/api/episode';
import type { FileType } from '@/core/types/api/file';
import type { InfiniteData } from '@tanstack/react-query';

const parseFlag = (flag?: boolean) => {
  if (flag == null) return 'N/A';
  if (flag) return 'Yes';
  return 'No';
};

const mapFiles = (data: InfiniteData<ListResultType<EpisodeType>>): Map<number, FileType> => {
  const files = data.pages
    .flatMap(page => page.List)
    .flatMap(episode => episode.Files);

  return new Map(
    files
      .filter(file => file != null)
      .map(file => [file.ID, file] as const),
  );
};

const handleSuccess = (fileId: number, seriesId: number, type: 'delete' | 'variation', variation?: boolean) => {
  queryClient.setQueriesData<InfiniteData<ListResultType<EpisodeType>>>(
    { queryKey: ['release-management', 'series', 'episodes', 'MultipleReleases', seriesId], type: 'active' },
    prevData =>
      produce(prevData, (draft) => {
        if (!draft) return;
        const filesMap = mapFiles(draft);
        const foundFile = filesMap.get(fileId);

        if (!foundFile) return;

        if (type === 'delete') {
          foundFile.Size = -1;
        } else {
          foundFile.IsVariation = !!variation;
        }
      }),
  );
};

type Props = {
  episode?: EpisodeType;
  file: FileType;
  handleEpisodeChange: (type: 'previous' | 'next') => void;
  seriesId: number;
};

const MultipleReleasesInfo = (props: Props) => {
  const { episode, file, handleEpisodeChange, seriesId } = props;

  const [confirmDelete, toggleConfirmDelete] = useToggle();

  const managedFoldersQuery = useManagedFoldersQuery();

  const { isPending: markVariationPending, mutate: markVariation } = useMarkVariationMutation();
  const { mutateAsync: deleteFile } = useDeleteFileMutation();

  const handleMarkVariation = (fileId: number, variation: boolean) => {
    markVariation({ fileId, variation }, {
      onSuccess: () => handleSuccess(fileId, seriesId, 'variation', variation),
    });
  };

  const handleDelete = async () => {
    await deleteFile({ fileId: file.ID })
      .then(() => {
        handleSuccess(file.ID, seriesId, 'delete');
        if (!episode?.Files) return;
        // We check for `=== 2` here since we are checking stale data
        const oneFileLeft = episode.Files.filter(episodeFile => episodeFile.Size > 0).length === 2;
        if (oneFileLeft) handleEpisodeChange('next');
      });
  };

  // To re-enable the correct keybinds once the delete confirmation modal closes
  useToggleModalKeybinds(true, confirmDelete);

  const path = file.Locations[0]?.RelativePath ?? '';
  const match = /[/\\](?=[^/\\]*$)/g.exec(path);
  const relativePath = match ? path?.substring(0, match.index) : 'Root Level';
  const fileName = path?.split(/[/\\]/g).pop();
  const folderName = managedFoldersQuery.data?.find(
    folder => folder.ID === file.Locations[0].ManagedFolderID,
  )?.Name ?? '';
  const importedDate = dayjs(file.Imported);
  const isDeleted = file.Size === -1;

  return (
    <>
      <div
        key={file.ID}
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
            className="flex flex-col"
            data-tooltip-id="tooltip"
            data-tooltip-content={isDeleted ? '' : file.Locations[0].AbsolutePath}
            data-tooltip-delay-show={500}
          >
            <span className="line-clamp-1 text-sm font-semibold opacity-65">
              {folderName}
              &nbsp;-&nbsp;
              {relativePath}
            </span>
            <span className="line-clamp-1">
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
              onClick={toggleConfirmDelete}
              tooltip={isDeleted ? '' : 'Delete'}
              disabled={isDeleted}
            >
              <Icon path={mdiTrashCanOutline} size={1} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 overflow-auto border-t border-panel-border py-2 text-sm md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

        <div className="grid grid-cols-1 gap-y-2 overflow-auto border-t border-panel-border py-2 text-sm">
          <div className="line-clamp-1">
            Audio:&nbsp;
            {file.MediaInfo?.Audio && file.MediaInfo.Audio.length > 0
              ? map(
                file.MediaInfo.Audio,
                item => item.Language,
              )
                .filter(item => !!item)
                .join(', ')
              : 'N/A'}
          </div>

          <div className="line-clamp-1">
            Subtitles:&nbsp;
            {file.MediaInfo?.Subtitles && file.MediaInfo.Subtitles.length > 0
              ? map(
                file.MediaInfo.Subtitles,
                item => item.Language,
              )
                .filter(item => !!item)
                .join(', ')
              : 'N/A'}
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmationPromptModal
          onConfirm={handleDelete}
          onClose={toggleConfirmDelete}
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
      )}
    </>
  );
};

export default MultipleReleasesInfo;
