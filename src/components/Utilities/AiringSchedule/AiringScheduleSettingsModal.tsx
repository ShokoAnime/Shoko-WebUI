import { useState } from 'react';
import type { ReactNode } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import cx from 'classnames';

import AiringChannelCountryBadge from '@/components/AiringChannelCountryBadge';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import { matchesChannelSearch } from '@/core/utilities/airingChannels';
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

/**
 * The airing schedule's on-the-fly channel filter: switches the channels off and on in every view, for this session
 * only. It also holds the other channel-like restrictions passed as `children`. Every change applies at once.
 */
const AiringScheduleSettingsModal = ({ channels, children, onClose, onHide, onShow, show }: Props) => {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const shownChannels = channels.filter(channel => matchesChannelSearch(query, [channel.name], channel.countryCode));
  const onCount = channels.filter(channel => channel.isOn).length;
  const shownIds = shownChannels.map(channel => channel.id);

  useToggleModalKeybinds(show, 'modal');
  useToggleModalKeybinds(!show, 'primary');
  useHotkeys('escape', onClose, { scopes: 'modal', enabled: show });

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header="Airing Schedule Settings"
      size="sm"
      footer={
        <div className="flex items-center justify-between gap-x-6">
          <span className="text-xs opacity-65">
            Switching a channel here changes every view, for this session; it is not saved. The channels hidden in the
            settings start off.
          </span>
          <Button onClick={onClose} buttonType="secondary" buttonSize="normal">Close</Button>
        </div>
      }
    >
      {children && <div className="flex flex-col gap-y-2">{children}</div>}
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
