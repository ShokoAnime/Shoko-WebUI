import { createSlice } from '@reduxjs/toolkit';
import { forEach } from 'lodash';

import type { ReleaseProviderInfoType } from '@/core/react-query/release-info/types';
import type { PayloadAction } from '@reduxjs/toolkit';

type State = {
  initialized: boolean;
  providers: ReleaseProviderInfoType[];
  webuiProviders: ReleaseProviderInfoType[];
};

type SetProvidersActionType = {
  providers: ReleaseProviderInfoType[];
  webuiProviders: ReleaseProviderInfoType[];
};

type ReorderProviderActionType = {
  type: 'server' | 'webui';
  sourceIndex: number;
  destinationIndex: number;
};

type ToggleProviderActionType = {
  type: 'server' | 'webui';
  id: string;
  checked: boolean;
};

const initialState: State = {
  initialized: false,
  providers: [],
  webuiProviders: [],
};

const release = createSlice({
  name: 'release',
  initialState,
  reducers: {
    clearReleaseSettings(sliceState) {
      Object.assign(sliceState, initialState);
    },
    setProviders(sliceState, action: PayloadAction<SetProvidersActionType>) {
      sliceState.providers = action.payload.providers;
      sliceState.webuiProviders = action.payload.webuiProviders;
      sliceState.initialized = true;
    },
    reorderProvider(sliceState, action: PayloadAction<ReorderProviderActionType>) {
      const { destinationIndex, sourceIndex, type } = action.payload;
      const providers = type === 'server' ? sliceState.providers : sliceState.webuiProviders;

      const [removed] = providers.splice(sourceIndex, 1);
      providers.splice(destinationIndex, 0, removed);
      forEach(providers, (draft, index) => {
        draft.Priority = index;
      });
    },
    toggleProvider(sliceState, action: PayloadAction<ToggleProviderActionType>) {
      const { checked, id, type } = action.payload;

      const providers = type === 'server' ? sliceState.providers : sliceState.webuiProviders;
      const item = providers.find(provider => provider.ID === id);
      if (item) item.IsEnabled = checked;
    },
  },
});

export const {
  clearReleaseSettings,
  reorderProvider,
  setProviders,
  toggleProvider,
} = release.actions;

export default release.reducer;
