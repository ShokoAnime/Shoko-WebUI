import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useOverrideEpisodeTitleMutation } from '@/core/react-query/episode/mutations';
import toast from '@/core/toast';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { EpisodeType } from '@/core/types/api/episode';

type Props = {
  show: boolean;
  onRequestClose: () => void;
  episode: EpisodeType;
  seriesId: number;
  nextUp?: boolean;
};

const EditEpisodeTitleModal = ({ episode, nextUp, onRequestClose, seriesId, show }: Props) => {
  const [title, setTitle] = useState('');

  const episodeId = episode.IDs.ID;
  const { isPending, mutate: overrideTitle } = useOverrideEpisodeTitleMutation(episodeId, seriesId, nextUp);

  const handleSave = () => {
    if (isPending) return;
    overrideTitle(title, {
      onSuccess: () => {
        toast.success('Episode title updated successfully!');
        onRequestClose();
      },
      onError: () => toast.error('Episode title could not be updated!'),
    });
  };

  const handleReset = () => {
    if (isPending) return;
    overrideTitle('', {
      onSuccess: () => {
        toast.success('Episode title reset to default!');
        onRequestClose();
      },
      onError: () => toast.error('Episode title could not be reset!'),
    });
  };

  useToggleModalKeybinds(show, 'modal');
  useToggleModalKeybinds(!show, 'primary');
  useHotkeys('escape', () => !isPending && onRequestClose(), { scopes: 'modal' });
  useHotkeys('enter', handleSave, { scopes: 'modal', enableOnFormTags: true });

  return (
    <ModalPanel
      show={show}
      onRequestClose={isPending ? undefined : onRequestClose}
      onAfterOpen={() => setTitle(episode.Name)}
      size="sm"
      header="Edit Episode Title"
      footer={
        <div className="flex justify-between gap-x-3">
          <Button
            buttonType="secondary"
            buttonSize="normal"
            onClick={handleReset}
            disabled={isPending || !episode.HasCustomName}
          >
            Reset to Default
          </Button>
          <div className="flex gap-x-3">
            <Button buttonType="secondary" buttonSize="normal" onClick={onRequestClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              buttonType="primary"
              buttonSize="normal"
              onClick={handleSave}
              disabled={isPending || !title}
              loading={isPending}
            >
              Save
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-y-4">
        <Input
          id="episode-title"
          type="text"
          label="Title"
          value={title}
          onChange={event => setTitle(event.target.value)}
          autoFocus
        />
        {episode.AniDB && episode.AniDB.Titles.length > 0 && (
          <div className="flex max-h-64 cursor-pointer flex-col gap-y-2 overflow-y-auto rounded-lg border border-panel-border bg-panel-input p-6">
            {episode.AniDB.Titles.map(episodeTitle => (
              <div
                className="flex justify-between transition-colors last:border-none hover:text-panel-text-primary"
                key={episodeTitle.Name + episodeTitle.Language}
                onClick={() => setTitle(episodeTitle.Name)}
              >
                <div>{episodeTitle.Name}</div>
                <div className="shrink-0 text-right uppercase">{episodeTitle.Language}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalPanel>
  );
};

export default EditEpisodeTitleModal;
