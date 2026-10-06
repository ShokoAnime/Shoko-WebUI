import { useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import cx from 'classnames';
import { produce } from 'immer';
import { isEqual } from 'lodash';

import AiringChannelCountryBadge from '@/components/AiringChannelCountryBadge';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import SeasonSectionsEditor from '@/components/Utilities/AiringSchedule/SeasonSectionsEditor';
import ToggleChips from '@/components/Utilities/AiringSchedule/ToggleChips';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { matchesChannelSearch } from '@/core/utilities/airingChannels';
import {
  RECENTLY_AIRED_MAX_HOURS,
  RECENTLY_AIRED_MIN_HOURS,
  clampRecentlyAiredHours,
} from '@/core/utilities/airingSchedule';
import useSyncedState from '@/hooks/useSyncedState';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { SeasonSectionDefinitionType } from '@/core/types/api/airing-season';
import type { EpisodeTypeValues } from '@/core/types/api/episode';
import type { WebUISettingsType } from '@/core/types/api/settings';

/** One channel of the filter, with how many of the view's airings it carries. */
export type ChannelFilterItemType = {
  id: string;
  name: string;
  /** ISO 3166-1 alpha-2, or `null`. */
  countryCode: string | null;
  /** `null` where the view has no airings on it, or none to count, as in the season view. */
  count: number | null;
  isOn: boolean;
  /** Hidden for everyone on the settings page, so off unless turned on here. */
  isHiddenInSettings: boolean;
};

type Props = {
  show: boolean;
  onClose: () => void;
  channels: ChannelFilterItemType[];
  onHide: (ids: string[]) => void;
  onShow: (ids: string[]) => void;
  /** More controls shown above the channel list, such as the airing kind and provider. */
  children?: ReactNode;
};

// Past this many channels, the list gets a search box.
const SEARCH_THRESHOLD = 8;

// How long typing or editing must pause before the saved settings are.
const SAVE_DELAY = 500;

type TabType = 'general' | 'sections';

const tabs: { label: string, value: TabType }[] = [
  { label: 'General', value: 'general' },
  { label: 'Sections', value: 'sections' },
];

const episodeTypeOptions: { label: string, value: EpisodeTypeValues }[] = [
  { label: 'Episodes', value: 'Episode' },
  { label: 'Specials', value: 'Special' },
  { label: 'Credits', value: 'Credits' },
  { label: 'Trailers', value: 'Trailer' },
  { label: 'Parodies', value: 'Parody' },
  { label: 'Other', value: 'Other' },
];

const allEpisodeTypes = episodeTypeOptions.map(option => option.value);

type SavedSettingsType = Pick<
  WebUISettingsType['airingSchedule'],
  'oldestSeasonYear' | 'recentlyAired' | 'sections' | 'episodeTypes'
>;

/**
 * The airing schedule's settings, in two tabs. General holds the on-the-fly channel filter, which switches the
 * channels off and on in every view for this session only, the other channel-like restrictions passed as `children`,
 * and the saved season view's oldest year, recently aired look back and episode types. Sections edits the season
 * view's saved layout. Every change applies at once.
 */
const AiringScheduleSettingsModal = ({ channels, children, onClose, onHide, onShow, show }: Props) => {
  const settings = useSettingsQuery().data;
  const { mutate: patchSettings } = usePatchSettingsMutation();
  const { episodeTypes, oldestSeasonYear, recentlyAired, sections } = settings.WebUI_Settings.airingSchedule;
  const [tab, setTab] = useState<TabType>('general');
  // A number typed digit by digit is saved once typing pauses, or as the modal closes, never half-typed. The changes
  // still to save are saved together, so one never undoes another.
  const [yearDraft, setYearDraft] = useSyncedState(oldestSeasonYear);
  const [enabledDraft, setEnabledDraft] = useSyncedState(recentlyAired.enabled);
  const [hoursDraft, setHoursDraft] = useSyncedState<number, number | null>(recentlyAired.hours);
  const [episodeTypesDraft, setEpisodeTypesDraft] = useSyncedState(episodeTypes);
  const pendingSave = useRef<{ timer: number, changes: Partial<SavedSettingsType> } | null>(null);
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const shownChannels = channels.filter(channel => matchesChannelSearch(query, [channel.name], channel.countryCode));
  const onCount = channels.filter(channel => channel.isOn).length;
  const shownIds = shownChannels.map(channel => channel.id);

  const savePending = () => {
    if (!pendingSave.current) return;
    const { changes, timer } = pendingSave.current;
    pendingSave.current = null;
    window.clearTimeout(timer);
    const newSettings = produce(settings, (draftSettings) => {
      Object.assign(draftSettings.WebUI_Settings.airingSchedule, changes);
    });
    if (isEqual(newSettings.WebUI_Settings.airingSchedule, settings.WebUI_Settings.airingSchedule)) return;
    patchSettings(newSettings);
  };

  const queueSave = (changes: Partial<SavedSettingsType>) => {
    if (pendingSave.current) window.clearTimeout(pendingSave.current.timer);
    pendingSave.current = {
      timer: window.setTimeout(savePending, SAVE_DELAY),
      changes: { ...pendingSave.current?.changes, ...changes },
    };
  };

  const handleYearChange = (event: ChangeEvent<HTMLInputElement>) => {
    const year = event.target.value === '' ? null : Number(event.target.value);
    setYearDraft(year);
    queueSave({ oldestSeasonYear: year });
  };

  // The look back's switch saves at once, with any number still waiting.
  const handleRecentlyAiredToggle = (event: ChangeEvent<HTMLInputElement>) => {
    setEnabledDraft(event.target.checked);
    queueSave({ recentlyAired: { enabled: event.target.checked, hours: hoursDraft ?? recentlyAired.hours } });
    savePending();
  };

  // Emptied, the hours keep their saved value; out of bounds, they are brought within.
  const handleHoursChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === '') {
      setHoursDraft(null);
      return;
    }
    const hours = clampRecentlyAiredHours(Number(event.target.value));
    setHoursDraft(hours);
    queueSave({ recentlyAired: { enabled: enabledDraft, hours } });
  };

  // Every type on is no filter at all; the last type on stays on.
  const handleEpisodeTypesChange = (selected: EpisodeTypeValues[]) => {
    if (selected.length === 0) return;
    const newTypes = selected.length === allEpisodeTypes.length ? null : selected;
    setEpisodeTypesDraft(newTypes);
    queueSave({ episodeTypes: newTypes });
  };

  // Going back to the default saves at once, with anything still waiting.
  const handleSectionsChange = (newSections: SeasonSectionDefinitionType[] | null) => {
    queueSave({ sections: newSections });
    if (newSections === null) savePending();
  };

  const handleClose = () => {
    savePending();
    if (hoursDraft === null) setHoursDraft(recentlyAired.hours);
    onClose();
  };

  useToggleModalKeybinds(show, 'modal');
  useToggleModalKeybinds(!show, 'primary');
  useHotkeys('escape', handleClose, { scopes: 'modal', enabled: show });

  return (
    <ModalPanel
      show={show}
      onRequestClose={handleClose}
      header="Airing Schedule Settings"
      size="md"
      noPadding
      footer={
        <div className="flex items-center justify-between gap-x-6">
          <span className="text-xs opacity-65">
            {tab === 'general'
              ? 'Switching a channel here changes every view, for this session; it is not saved. The channels hidden in the settings start off.'
              : 'The layout is saved as you edit it.'}
          </span>
          <Button onClick={handleClose} buttonType="secondary" buttonSize="normal">Close</Button>
        </div>
      }
    >
      <div className="flex min-h-0 gap-x-6 p-6">
        <div className="flex shrink-0 flex-col gap-y-1 font-semibold">
          {tabs.map(item => (
            <div
              className={cx(
                'w-30 cursor-pointer rounded-lg p-3 text-center',
                tab === item.value
                  ? 'bg-panel-menu-item-background text-panel-menu-item-text'
                  : 'transition-colors hover:bg-panel-menu-item-background-hover',
              )}
              key={item.value}
              onClick={() => setTab(item.value)}
            >
              {item.label}
            </div>
          ))}
        </div>
        <div className="border-r border-panel-border" />
        {/* Both tabs stay mounted, so the section rows keep their keys and an open editor while General is shown. */}
        <div className={cx('flex min-w-0 grow flex-col gap-y-6', tab !== 'general' && 'hidden')}>
          {children && <div className="flex flex-col gap-y-2">{children}</div>}
          <div className="flex flex-col gap-y-1">
            <span className="font-semibold">Season View</span>
            <div className="flex items-center justify-between gap-x-2">
              <span>Oldest Year</span>
              <InputSmall
                id="oldest-season-year"
                type="number"
                placeholder="All"
                value={yearDraft ?? ''}
                onChange={handleYearChange}
                className="w-20 px-3 py-1 text-center"
              />
            </div>
            <span className="text-sm opacity-65">
              The seasons of earlier years are left out of the season view. Leave it empty for every year. Unlike the
              channels, it is saved.
            </span>
            <Checkbox
              justify
              id="recently-aired"
              label="Show Recently Aired"
              isChecked={enabledDraft}
              onChange={handleRecentlyAiredToggle}
              className="mt-2"
            />
            {enabledDraft && (
              <div className="flex items-center justify-between gap-x-2">
                <span>Hours</span>
                <InputSmall
                  id="recently-aired-hours"
                  type="number"
                  value={hoursDraft ?? ''}
                  onChange={handleHoursChange}
                  min={RECENTLY_AIRED_MIN_HOURS}
                  max={RECENTLY_AIRED_MAX_HOURS}
                  className="w-20 px-3 py-1 text-center"
                />
              </div>
            )}
            <span className="text-sm opacity-65">
              {`In the current and previous seasons, each card keeps its episode for these hours after it airs, from ${RECENTLY_AIRED_MIN_HOURS} to ${RECENTLY_AIRED_MAX_HOURS}. It is saved too.`}
            </span>
          </div>
          <div className="flex flex-col gap-y-2">
            <span className="font-semibold">Episode Types</span>
            <ToggleChips
              options={episodeTypeOptions}
              selected={episodeTypesDraft ?? allEpisodeTypes}
              onChange={handleEpisodeTypesChange}
            />
            <span className="text-sm opacity-65">
              The season and calendar views show only the airings of these AniDB episode types. It is saved too.
            </span>
          </div>
          <div className="flex flex-col gap-y-3">
            <div className="flex items-center justify-between gap-x-2">
              <span className="font-semibold">
                Channels
                <span className="ml-1.5 font-normal opacity-65">{`${onCount} of ${channels.length} on`}</span>
              </span>
              <div className="flex gap-x-2">
                <Button buttonType="secondary" className="px-2 py-1 whitespace-nowrap" onClick={() => onShow(shownIds)}>
                  Show All
                </Button>
                <Button buttonType="secondary" className="px-2 py-1 whitespace-nowrap" onClick={() => onHide(shownIds)}>
                  Hide All
                </Button>
              </div>
            </div>
            {channels.length > SEARCH_THRESHOLD && (
              <InputSmall
                id="channel-search"
                type="text"
                placeholder="Search..."
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="px-3 py-1"
              />
            )}
            <div className="-mx-2 flex max-h-80 flex-col overflow-y-auto">
              {shownChannels.length === 0 && (
                <span className="p-2 opacity-65">{channels.length === 0 ? 'No channels yet.' : 'No match.'}</span>
              )}
              {shownChannels.map(channel => (
                <Checkbox
                  key={channel.id}
                  id={`channel-filter-${channel.id}`}
                  isChecked={channel.isOn}
                  onChange={event => (event.target.checked ? onShow([channel.id]) : onHide([channel.id]))}
                  justify
                  label={
                    <span className="flex min-w-0 items-center gap-x-1.5">
                      <span className={cx('truncate', !channel.isOn && 'opacity-65')}>{channel.name}</span>
                      <AiringChannelCountryBadge countryCode={channel.countryCode} />
                      {channel.isHiddenInSettings && (
                        <span
                          className="shrink-0 text-xs text-panel-text-warning"
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Hidden for everyone in the airing schedule settings"
                        >
                          Hidden
                        </span>
                      )}
                      {channel.count !== null && <span className="shrink-0 text-xs opacity-65">{channel.count}</span>}
                    </span>
                  }
                  labelClassName="min-w-0"
                  className="shrink-0 rounded-md px-2 transition-colors focus-within:bg-panel-menu-item-background-hover hover:bg-panel-menu-item-background-hover"
                />
              ))}
            </div>
          </div>
        </div>
        <div className={cx('flex min-w-0 grow flex-col', tab !== 'sections' && 'hidden')}>
          <SeasonSectionsEditor sections={sections} onChange={handleSectionsChange} />
        </div>
      </div>
    </ModalPanel>
  );
};

export default AiringScheduleSettingsModal;
