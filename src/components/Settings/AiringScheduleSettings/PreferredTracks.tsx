import { useState } from 'react';
import { mdiMinusCircleOutline, mdiPlusCircleOutline, mdiTranslate } from '@mdi/js';
import { Icon } from '@mdi/react';
import { produce } from 'immer';

import LanguagesModal from '@/components/Dialogs/LanguagesModal';
import DnDList from '@/components/DnDList/DnDList';
import Button from '@/components/Input/Button';
import SelectSmall from '@/components/Input/SelectSmall';
import { useSupportedLanguagesQuery } from '@/core/react-query/settings/queries';

import type { AiringKindType, AiringTrackPreferenceType } from '@/core/types/api/airing-schedule';
import type { DropResult } from '@hello-pangea/dnd';

type Props = {
  tracks: AiringTrackPreferenceType[];
  onChange: (tracks: AiringTrackPreferenceType[]) => void;
};

const kinds: AiringKindType[] = ['Original', 'Subtitled', 'Dubbed'];

/**
 * Pseudo-languages a track is never in: the main title language, the transcriptions of titles, and `unk`, which the
 * server uses for an unknown track language.
 */
const EXCLUDED_TRACK_LANGUAGES = ['x-main', 'x-jat', 'x-zht', 'x-kot', 'x-tht', 'unk'];

/**
 * The server's preferred tracks, best first, laid out like the language order lists: a kind, and optionally a
 * language picked from the supported languages. Empty means no preference.
 */
const PreferredTracks = ({ onChange, tracks }: Props) => {
  const languagesQuery = useSupportedLanguagesQuery();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // The server keeps the codes in lower case, while the supported languages spell some with capitals (e.g. fr-CA).
  const findLanguageKey = (
    code: string | null,
  ) => (code === null ? undefined : Object.keys(languagesQuery.data ?? {}).find(key => key.toLowerCase() === code));
  const getLanguageName = (code: string | null) => {
    if (code === null) return 'Any Language';
    const key = findLanguageKey(code.toLowerCase());
    return key ? languagesQuery.data![key] : code;
  };

  const updateTrack = (index: number, track: Partial<AiringTrackPreferenceType>) =>
    onChange(produce(tracks, (draftTracks) => {
      Object.assign(draftTracks[index], track);
    }));

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;

    const items = [...tracks];
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    onChange(items);
  };

  const editingTrack = editingIndex === null ? undefined : tracks[editingIndex];
  const editingKey = findLanguageKey(editingTrack?.LanguageCode?.toLowerCase() ?? null);

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-1">
          Preferred Tracks
          {tracks.length > 0 && <span className="text-xs opacity-65">(Drag to Reorder)</span>}
        </div>
        <Button onClick={() => onChange([...tracks, { Kind: 'Original', LanguageCode: null }])} tooltip="Add Track">
          <Icon className="text-panel-icon-action" path={mdiPlusCircleOutline} size={1} />
        </Button>
      </div>
      <div className="flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
        {tracks.length > 0
          ? (
            <DnDList onDragEnd={onDragEnd}>
              {tracks.map((track, index) => ({
                // By position: the entries are edited in place and may repeat until saved.
                key: `track-${index}`,
                item: (
                  <div className="flex items-center justify-between gap-x-3 py-1">
                    <SelectSmall
                      id={`airing-track-kind-${index}`}
                      value={track.Kind}
                      onChange={event => updateTrack(index, { Kind: event.target.value as AiringKindType })}
                    >
                      {kinds.map(kind => <option key={kind} value={kind}>{kind}</option>)}
                    </SelectSmall>
                    <div className="flex items-center gap-x-2">
                      <Button
                        className="flex items-center gap-x-2 font-normal!"
                        disabled={!languagesQuery.isSuccess}
                        onClick={() => setEditingIndex(index)}
                        tooltip="Pick Language"
                      >
                        <Icon className="text-panel-icon-action" path={mdiTranslate} size={0.8} />
                        {getLanguageName(track.LanguageCode)}
                      </Button>
                      <Button onClick={() => onChange(tracks.filter((_, other) => other !== index))} tooltip="Remove">
                        <Icon className="text-panel-icon-action" path={mdiMinusCircleOutline} size={1} />
                      </Button>
                    </div>
                  </div>
                ),
              }))}
            </DnDList>
          )
          : <div className="text-sm opacity-65">No track preference set. Every track counts the same.</div>}
      </div>
      <LanguagesModal
        type={editingTrack ? 'Track' : null}
        onClose={() => setEditingIndex(null)}
        exclude={EXCLUDED_TRACK_LANGUAGES}
        selection={{
          languages: editingKey ? [editingKey] : [],
          multiple: false,
          noneLabel: 'Any Language',
          onChange: (languages) => {
            if (editingIndex !== null) updateTrack(editingIndex, { LanguageCode: languages[0]?.toLowerCase() ?? null });
          },
        }}
      />
    </div>
  );
};

export default PreferredTracks;
