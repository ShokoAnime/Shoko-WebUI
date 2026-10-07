import { countBy, sortBy } from 'lodash';

import { useAiringChannelsQuery } from '@/core/react-query/airing-schedule/queries';
import { setChannelOverrides } from '@/core/slices/utilities/airingSchedule';
import { useDispatch, useSelector } from '@/core/store';
import toast from '@/core/toast';

import type { ChannelFilterItemType } from '@/components/Utilities/AiringSchedule/AiringScheduleSettingsModal';
import type { AiringChannelReferenceType, EpisodeAiringType } from '@/core/types/api/airing-schedule';

// Shared, so a session from before the overrides existed does not make the filter's lists anew on every render.
const noOverrides: Record<string, boolean> = {};

/**
 * The airing schedule's channel filter, shared by every view and kept in Redux for the session. By default the visible
 * channels are on and the hidden ones off, and nothing is sent; once changed, `channel` lists the channels that are on.
 */
const useAiringChannelFilter = () => {
  const dispatch = useDispatch();
  const overrides = useSelector(state => state.utilities.airingSchedule.channelOverrides) ?? noOverrides;
  const channelsQuery = useAiringChannelsQuery();
  const channels = channelsQuery.data ?? [];
  const isDefault = Object.keys(overrides).length === 0;
  const isOn = (id: string, isHidden: boolean) => overrides[id] ?? !isHidden;
  const hiddenById = new Map(channels.map(channel => [channel.ID, channel.IsHidden]));

  const onIds = channels.filter(item => isOn(item.ID, item.IsHidden)).map(item => item.ID);
  // Comma-separated, which keeps the query short with a hundred channels.
  const channel = isDefault ? undefined : onIds.join(',');

  /** Every known channel for the filter's list, with how many of the view's `airings` it carries. */
  const getItems = (airings: EpisodeAiringType[]): ChannelFilterItemType[] => {
    const counts = countBy(airings.filter(airing => airing.Channel), airing => airing.Channel!.ID);
    return sortBy(
      channels.map(item => ({
        id: item.ID,
        name: item.Name,
        countryCode: item.CountryCode ?? null,
        count: counts[item.ID] ?? null,
        isOn: isOn(item.ID, item.IsHidden),
        isHiddenInSettings: item.IsHidden,
      })),
      item => item.name.toLowerCase(),
    );
  };

  // An override equal to the channel's default is dropped, so the default sends nothing.
  const setOn = (ids: string[], turnOn: boolean) =>
    dispatch(
      setChannelOverrides(Object.fromEntries(ids.map(id => [id, turnOn === !hiddenById.get(id) ? null : turnOn]))),
    );

  const hideChannel = (target: AiringChannelReferenceType) => {
    const previous = overrides[target.ID] ?? null;
    setOn([target.ID], false);
    const toastId = `hide-channel-${target.ID}`;
    toast.info(
      'Channel Hidden',
      <span>
        {`${target.Name} is off in the airing schedule.`}
        &nbsp;
        <button
          type="button"
          className="font-semibold text-panel-text-primary"
          onClick={() => {
            dispatch(setChannelOverrides({ [target.ID]: previous }));
            toast.dismiss(toastId);
          }}
        >
          Undo
        </button>
      </span>,
      { toastId },
    );
  };

  return {
    /** The `channel` the reads take: `undefined` by default, else the channels that are on. */
    channel,
    /** Whether the reads can go out: the channel list is in when it is needed, and some channel is on. */
    enabled: isDefault || (channelsQuery.isSuccess && onIds.length > 0),
    getItems,
    hideChannel,
    hide: (ids: string[]) => setOn(ids, false),
    show: (ids: string[]) => setOn(ids, true),
  };
};

export default useAiringChannelFilter;
