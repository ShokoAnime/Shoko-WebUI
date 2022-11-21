import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SeriesAniDBSearchResult } from '../../types/api/series';
import { FileType } from '../../types/api/file';
import { forEach } from 'lodash';

type ManualLink = { 
  FileID: number; 
  EpisodeID: number; 
};

type State = {
  manualLink: boolean;
  selectedSeries: SeriesAniDBSearchResult;
  selectedFile: number;
  selectedRows: FileType[];
  links: Array<ManualLink>;
};

const  unrecognizedSlice = createSlice({
  name: 'unrecognized',
  initialState: {
    manualLink: false,
    selectedSeries: {},
    selectedFile: 1,
    selectedRows: [] as FileType[],
  } as State,
  reducers: {
    setManualLink(sliceState, action: PayloadAction<boolean>) {
      sliceState.manualLink = action.payload;
    },
    setSelectedSeries(sliceState, action: PayloadAction<SeriesAniDBSearchResult>) {
      sliceState.selectedSeries = action.payload;
    },
    setSelectedFile(sliceState, action: PayloadAction<number>) {
      sliceState.selectedFile = action.payload;
    },
    setSelectedRows(sliceState, action: PayloadAction<FileType[]>) {
      sliceState.selectedRows = action.payload;
    },
    setLinks(sliceState, action: PayloadAction<Array<ManualLink>>) {
      sliceState.links = action.payload;
    },
    setLinksEpisode(sliceState, action: PayloadAction<ManualLink>) {
      forEach(sliceState.links, (link, idx) => {
        if (link.FileID === action.payload.FileID) {
          sliceState.links[idx].EpisodeID = action.payload.EpisodeID;
        }
      });
    },
    addLinkEpisode(sliceState, action: PayloadAction<ManualLink>) {
      sliceState.links.push({ FileID: action.payload.FileID, EpisodeID: 0 });
    },
  },
});

export const { setManualLink, setSelectedSeries, setSelectedFile, setSelectedRows, setLinks, setLinksEpisode, addLinkEpisode } = unrecognizedSlice.actions;

export default unrecognizedSlice.reducer;
