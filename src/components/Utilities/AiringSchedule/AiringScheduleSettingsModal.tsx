import { useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import cx from 'classnames';
import { produce } from 'immer';

import AiringChannelCountryBadge from '@/components/AiringChannelCountryBadge';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { matchesChannelSearch } from '@/core/utilities/airingChannels';
import useSyncedState from '@/hooks/useSyncedState';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

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

// How long typing must pause before the season view's oldest year is saved.
const YEAR_SAVE_DELAY = 750;

/**
 * The airing schedule's on-the-fly channel filter: switches the channels off and on in every view, for this session
 * only. It also holds the other channel-like restrictions passed as `children`, and the season view's oldest year,
 * which is saved to the user's WebUI settings. Every change applies at once.
 */
const AiringScheduleSettingsModal = ({ channels, children, onClose, onHide, onShow, show }: Props) => {
  const settings = useSettingsQuery().data;
  const { mutate: patchSettings } = usePatchSettingsMutation();
  const { oldestSeasonYear } = settings.WebUI_Settings.airingSchedule;
  // A year typed digit by digit is saved once typing pauses, or as the modal closes, never half-typed.
  const [yearDraft, setYearDraft] = useSyncedState(oldestSeasonYear);
  const pendingYear = useRef<{ timer: number, year: number | null } | null>(null);
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const shownChannels = channels.filter(channel => matchesChannelSearch(query, [channel.name], channel.countryCode));
  const onCount = channels.filter(channel => channel.isOn).length;
  const shownIds = shownChannels.map(channel => channel.id);

  const saveYear = () => {
    if (!pendingYear.current) return;
    const { timer, year } = pendingYear.current;
    pendingYear.current = null;
    window.clearTimeout(timer);
    if (year === oldestSeasonYear) return;
    patchSettings(produce(settings, (draftSettings) => {
      draftSettings.WebUI_Settings.airingSchedule.oldestSeasonYear = year;
    }));
  };

  const handleYearChange = (event: ChangeEvent<HTMLInputElement>) => {
    const year = event.target.value === '' ? null : Number(event.target.value);
    setYearDraft(year);
    if (pendingYear.current) window.clearTimeout(pendingYear.current.timer);
    pendingYear.current = { timer: window.setTimeout(saveYear, YEAR_SAVE_DELAY), year };
  };

  const handleClose = () => {
    saveYear();
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
      size="sm"
      footer={
        <div className="flex items-center justify-between gap-x-6">
          <span className="text-xs opacity-65">
            Switching a channel here changes every view, for this session; it is not saved. The channels hidden in the
            settings start off.
          </span>
          <Button onClick={handleClose} buttonType="secondary" buttonSize="normal">Close</Button>
        </div>
      }
    >
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
    </ModalPanel>
  );
};

export default AiringScheduleSettingsModal;
