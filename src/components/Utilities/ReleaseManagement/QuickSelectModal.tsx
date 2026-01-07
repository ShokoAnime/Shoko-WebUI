import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { map, toNumber } from 'lodash';
import { useImmer } from 'use-immer';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { useDeleteFilesMutation } from '@/core/react-query/file/mutations';
import { resetQueries } from '@/core/react-query/queryClient';
import { useSeriesFileSummaryQuery } from '@/core/react-query/webui/queries';
import useEventCallback from '@/hooks/useEventCallback';

type Props = {
  show: boolean;
  onClose: () => void;
  seriesId: number;
};

const QuickSelectModal = ({ onClose, seriesId, show }: Props) => {
  const { t } = useTranslation('utilities');
  const fileSummaryQuery = useSeriesFileSummaryQuery(
    seriesId,
    {
      groupBy:
        'GroupName,FileSource,FileVersion,ImportFolder,VideoCodecs,VideoResolution,AudioLanguages,SubtitleLanguages,VideoHasChapters',
      includeEpisodeDetails: true,
    },
    show,
  );
  const fileSummary = fileSummaryQuery.data;

  const { isPending: isDeleting, mutate: deleteFiles } = useDeleteFilesMutation();

  const [groupsToDelete, setGroupsToDelete] = useImmer<Set<number>>(new Set());

  useEffect(() => {
    setGroupsToDelete(new Set());
  }, [setGroupsToDelete, show]);

  const handleCheckboxChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const index = toNumber(event.target.id.split('-')[1]);
    setGroupsToDelete((state) => {
      if (event.target.checked) state.add(index);
      else state.delete(index);
    });
  });

  const handleConfirm = useEventCallback(() => {
    const fileIds = map(
      [...groupsToDelete],
      groupIndex =>
        map(
          fileSummary?.Groups[groupIndex].Episodes,
          episode => episode.FileID,
        ),
    ).flat();

    deleteFiles(
      { fileIds, removeFolder: true },
      {
        onSuccess: () => {
          resetQueries(['release-management']);
          toast.success(t('releaseManagement.quickSelect.filesDeleted', { count: fileIds.length }));
          onClose();
        },
        onError: () => toast.error(t('releaseManagement.quickSelect.deleteError')),
      },
    );
  });

  const getAudioText = (languages: string[] | undefined) => {
    if (!languages || languages.length === 0) return t('releaseManagement.quickSelect.noAudio');
    const joined = languages.join(', ');
    return languages.length > 1
      ? t('releaseManagement.quickSelect.multiAudio', { languages: joined })
      : t('releaseManagement.quickSelect.singleAudio', { languages: joined });
  };

  const getSubtitleText = (languages: string[] | undefined) => {
    if (!languages || languages.length === 0) return t('releaseManagement.quickSelect.noSubs');
    const joined = languages.join(', ');
    return languages.length > 1
      ? t('releaseManagement.quickSelect.multiSubs', { languages: joined })
      : t('releaseManagement.quickSelect.singleSubs', { languages: joined });
  };

  return (
    <ModalPanel show={show} onRequestClose={onClose} header={t('releaseManagement.quickSelect.title')} size="sm">
      {fileSummaryQuery.isSuccess && (
        map(
          fileSummary?.Groups,
          (group, index) => (
            <div key={`group-${index}`} className="flex items-center justify-between gap-x-3">
              <div className="flex flex-col gap-y-1">
                <div className="font-semibold">
                  {group.GroupName === 'None' ? t('releaseManagement.quickSelect.manualLink') : group.GroupName}
                  &nbsp;-&nbsp;
                  {group.Episodes?.length}
                  &nbsp;
                  {t('releaseManagement.quickSelect.episodes')}
                  {group.RangeByType.Normal && (
                    <>
                      &nbsp;(
                      {group.RangeByType.Normal.Range}
                      )
                    </>
                  )}
                  &nbsp;-&nbsp;
                  {t('releaseManagement.quickSelect.version', { version: group.FileVersion })}
                </div>
                <div className="flex flex-wrap text-sm opacity-65">
                  {t('releaseManagement.quickSelect.importFolder')}
                  &nbsp;
                  {group.ImportFolder}
                </div>
                <div className="flex flex-wrap text-sm opacity-65">
                  {group.FileSource}
                  &nbsp;|&nbsp;
                  {group.VideoCodecs?.toUpperCase()}
                  &nbsp;|&nbsp;
                  {group.VideoResolution}
                  {group.AudioLanguages && (
                    <>
                      &nbsp;|&nbsp;
                      <div>{getAudioText(group.AudioLanguages)}</div>
                    </>
                  )}
                  {group.SubtitleLanguages && (
                    <>
                      &nbsp;|&nbsp;
                      <div>{getSubtitleText(group.SubtitleLanguages)}</div>
                    </>
                  )}
                  {group.VideoHasChapters && (
                    <>
                      &nbsp;|&nbsp;
                      <div>{t('releaseManagement.quickSelect.chaptered')}</div>
                    </>
                  )}
                </div>
              </div>
              <Checkbox
                id={`checkbox-${index}`}
                isChecked={groupsToDelete.has(index)}
                onChange={handleCheckboxChange}
                label={t('releaseManagement.quickSelect.deleteLabel')}
              />
            </div>
          ),
        )
      )}

      <div className="mt-4 flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-6 py-2">
          {t('releaseManagement.quickSelect.cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          buttonType="primary"
          className="px-6 py-2"
          loading={isDeleting}
        >
          {t('releaseManagement.quickSelect.confirm')}
        </Button>
      </div>
    </ModalPanel>
  );
};

export default QuickSelectModal;
