import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

type State = {
  /** The view the airing schedule was last on, opened when the URL names none. */
  lastView: string | null;
  /**
   * The channels the airing schedule's channel filter turned on or off, by ID, against the default of the visible
   * channels on and the hidden ones off. Kept for the session, never saved.
   */
  channelOverrides: Record<string, boolean>;
  /** Show every airing of an episode behind its lead, not just the lead. Kept for the session, never saved. */
  everyChannel: boolean;
};

const initialState: State = {
  lastView: null,
  channelOverrides: {},
  everyChannel: false,
};

const airingScheduleSlice = createSlice({
  name: 'airingSchedule',
  initialState,
  reducers: {
    /** Sets each channel on or off, or back to its default with `null`. */
    setChannelOverrides(sliceState, action: PayloadAction<Record<string, boolean | null>>) {
      const channelOverrides = { ...(sliceState.channelOverrides ?? {}) };
      for (const [id, isOn] of Object.entries(action.payload)) {
        if (isOn === null) delete channelOverrides[id];
        else channelOverrides[id] = isOn;
      }
      sliceState.channelOverrides = channelOverrides;
    },
    setEveryChannel(sliceState, action: PayloadAction<boolean>) {
      sliceState.everyChannel = action.payload;
    },
    setLastView(sliceState, action: PayloadAction<string>) {
      sliceState.lastView = action.payload;
    },
  },
});

export const { setChannelOverrides, setEveryChannel, setLastView } = airingScheduleSlice.actions;

export default airingScheduleSlice.reducer;
