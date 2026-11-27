import type { ChangeEvent } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { clamp, toNumber } from 'lodash';

import SeasonSectionsEditor from '@/components/Calendar/Settings/SeasonSectionsEditor';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import CheckboxGroup from '@/components/Input/CheckboxGroup';
import InputSmall from '@/components/Input/InputSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import useSyncedState from '@/hooks/useSyncedState';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { EpisodeTypeValues } from '@/core/types/api/episode';

type Props = {
  onClose: () => void;
  show: boolean;
};

const episodeTypeOptions: { label: string, value: EpisodeTypeValues }[] = [
  { label: 'Episodes', value: 'Episode' },
  { label: 'Specials', value: 'Special' },
  { label: 'Credits', value: 'Credits' },
  { label: 'Trailers', value: 'Trailer' },
  { label: 'Parodies', value: 'Parody' },
  { label: 'Other', value: 'Other' },
];

const MAX_RECENTLY_AIRED_HOURS = 24;

const AiringScheduleSettingsModal = ({ onClose, show }: Props) => {
  const settings = useSettingsQuery().data;
  const saved = settings.WebUI_Settings.airingSchedule;
  const { isPending, mutate: patchSettings } = usePatchSettingsMutation();
  const [draft, setDraft] = useSyncedState(saved);
  const { episodeTypes, oldestSeasonYear, recentlyAired, sections } = draft;

  const handleSave = () => {
    if (isPending) return;
    const hours = clamp(recentlyAired.hours, 1, MAX_RECENTLY_AIRED_HOURS);
    patchSettings(
      {
        ...settings,
        WebUI_Settings: {
          ...settings.WebUI_Settings,
          airingSchedule: { ...draft, recentlyAired: { ...recentlyAired, hours } },
        },
      },
      { onSuccess: onClose },
    );
  };

  const handleCancel = () => {
    if (isPending) return;
    setDraft(saved);
    onClose();
  };

  // Every type on is no filter at all, and the last type on stays on.
  const handleEpisodeTypesChange = (selected: EpisodeTypeValues[]) => {
    if (selected.length === 0) return;
    setDraft({ ...draft, episodeTypes: selected.length === episodeTypeOptions.length ? null : selected });
  };

  const handleHoursChange = (event: ChangeEvent<HTMLInputElement>) =>
    setDraft({
      ...draft,
      recentlyAired: { ...recentlyAired, hours: Math.min(toNumber(event.target.value), MAX_RECENTLY_AIRED_HOURS) },
    });

  useToggleModalKeybinds(show, 'modal');
  useToggleModalKeybinds(!show, 'primary');
  useHotkeys('escape', handleCancel, { scopes: 'modal', enabled: show });

  return (
    <ModalPanel
      show={show}
      onRequestClose={handleCancel}
      header="Schedule Settings"
      size="md"
      footer={
        <div className="flex justify-end gap-x-3">
          <Button onClick={handleCancel} buttonType="secondary" buttonSize="normal">Cancel</Button>
          <Button onClick={handleSave} buttonType="primary" buttonSize="normal" loading={isPending}>Save</Button>
        </div>
      }
    >
      <div className="flex max-h-[65vh] flex-col gap-y-6 overflow-y-auto pr-2">
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between gap-x-2">
            <span>Oldest Year</span>
            <InputSmall
              id="oldest-season-year"
              type="number"
              placeholder="All"
              value={oldestSeasonYear ?? ''}
              onChange={event =>
                setDraft({
                  ...draft,
                  oldestSeasonYear: event.target.value === '' ? null : toNumber(event.target.value),
                })}
              className="w-20 px-3 py-1 text-center"
            />
          </div>
          <span className="text-sm opacity-65">
            Seasons of earlier years are left out of the season view. Leave it empty for every year.
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <Checkbox
            justify
            id="recently-aired"
            label="Show Recently Aired"
            isChecked={recentlyAired.enabled}
            onChange={event =>
              setDraft({ ...draft, recentlyAired: { ...recentlyAired, enabled: event.target.checked } })}
          />
          {recentlyAired.enabled && (
            <div className="flex items-center justify-between gap-x-2">
              <span>Hours</span>
              <InputSmall
                id="recently-aired-hours"
                type="number"
                min={1}
                max={MAX_RECENTLY_AIRED_HOURS}
                value={recentlyAired.hours}
                onChange={handleHoursChange}
                className="w-20 px-3 py-1 text-center"
              />
            </div>
          )}
          <span className="text-sm opacity-65">
            In the current and previous seasons, a card keeps the episode that just aired for these hours, from 1 to 24,
            before it moves on to the next one.
          </span>
        </div>

        <div className="flex flex-col gap-y-2">
          <span>Episode Types</span>
          <CheckboxGroup
            idPrefix="episode-type"
            options={episodeTypeOptions}
            selected={episodeTypes ?? episodeTypeOptions.map(option => option.value)}
            onChange={handleEpisodeTypesChange}
          />
          <span className="text-sm opacity-65">The views show only the airings of these AniDB episode types.</span>
        </div>

        <SeasonSectionsEditor
          sections={sections}
          onChange={newSections => setDraft({ ...draft, sections: newSections })}
        />
      </div>
    </ModalPanel>
  );
};

export default AiringScheduleSettingsModal;
