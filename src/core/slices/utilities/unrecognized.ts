import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FileType } from '@/core/types/api/file';
import { forEach } from 'lodash';

export type ManualLink = { 
  FileID: number; 
  EpisodeID: number; 
};

type State = {
  selectedFile: number;
  selectedRows: FileType[];
  links: Array<ManualLink>;
};

const  unrecognizedSlice = createSlice({
  name: 'unrecognized',
  initialState: {
    selectedFile: 1,
    selectedRows: [] as FileType[],
    links: [] as ManualLink[],
  } as State,
  reducers: {
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
    removeLinkEpisode(sliceState, action: PayloadAction<ManualLink>) {
      const itemIndex = sliceState.links.reverse().findIndex(link => link.FileID === action.payload.FileID);
      sliceState.links.splice(itemIndex, 1);
    },
  },
});

export const { setSelectedFile, setSelectedRows, setLinks, setLinksEpisode, addLinkEpisode, removeLinkEpisode } = unrecognizedSlice.actions;

export default unrecognizedSlice.reducer;
