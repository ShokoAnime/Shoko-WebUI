import React, { useEffect } from 'react';
import { map, toNumber } from 'lodash';
import { useImmer } from 'use-immer';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { useDeleteFilesMutation } from '@/core/react-query/file/mutations';
import { useSeriesFileSummaryQuery } from '@/core/react-query/webui/queries';
import useEventCallback from '@/hooks/useEventCallback';

type Props = {
  show: boolean;
  onClose: () => void;
  seriesId: number;
};

const QuickSelectModal = ({ onClose, seriesId, show }: Props) => {
  const fileSummaryQuery = useSeriesFileSummaryQuery(
    seriesId,
    {
      groupBy:
        'GroupName,FileSource,FileVersion,VideoCodecs,VideoResolution,AudioLanguages,SubtitleLanguages,VideoHasChapters',
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

  const handleSave = useEventCallback(() => {
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
          toast.success(`${fileIds.length} ${fileIds.length === 1 ? 'file' : 'files'} deleted!`);
          onClose();
        },
        onError: () => toast.error('Files could not be deleted!'),
      },
    );
  });

  return (
    <ModalPanel show={show} onRequestClose={onClose} header="Quick Select" size="sm">
      {fileSummaryQuery.isSuccess && (
        map(
          fileSummary?.Groups,
          (group, index) => (
            <div key={`group-${index}`} className="flex items-center justify-between gap-x-3">
              <div className="flex flex-col gap-y-2">
                <div className="font-semibold">
                  {group.GroupName === 'None' ? 'Manual link' : group.GroupName}
                  &nbsp;-&nbsp;
                  {group.Episodes?.length}
                  &nbsp;Episodes
                  {group.RangeByType.Normal && (
                    <>
                      &nbsp;(
                      {group.RangeByType.Normal.Range}
                      )
                    </>
                  )}
                  &nbsp;-&nbsp;
                  {`v${group.FileVersion}`}
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
                      <div>
                        {group.AudioLanguages.length === 0 ? 'No Audio' : (
                          <>
                            {group.AudioLanguages.length > 1 ? 'Multi ' : 'Single '}
                            Audio (
                            {group.AudioLanguages.join(', ')}
                            )
                          </>
                        )}
                      </div>
                    </>
                  )}
                  {group.SubtitleLanguages && (
                    <>
                      &nbsp;|&nbsp;
                      <div>
                        {group.SubtitleLanguages.length === 0 ? 'No Subs' : (
                          <>
                            {group.SubtitleLanguages.length > 1 ? 'Multi ' : 'Single '}
                            Subs (
                            {group.SubtitleLanguages.join(', ')}
                            )
                          </>
                        )}
                      </div>
                    </>
                  )}
                  {group.VideoHasChapters && (
                    <>
                      &nbsp;|&nbsp;
                      <div>Chaptered</div>
                    </>
                  )}
                </div>
              </div>
              <Checkbox
                id={`checkbox-${index}`}
                isChecked={groupsToDelete.has(index)}
                onChange={handleCheckboxChange}
                label="Delete"
              />
            </div>
          ),
        )
      )}

      <div className="mt-4 flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-6 py-2">Cancel</Button>
        <Button
          onClick={handleSave}
          buttonType="primary"
          className="px-6 py-2"
          loading={isDeleting}
        >
          Save
        </Button>
      </div>
    </ModalPanel>
  );
};

export default QuickSelectModal;
