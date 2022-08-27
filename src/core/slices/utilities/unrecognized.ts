import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SeriesAniDBSearchResult } from '../../types/api/series';
import { FileType } from '../../types/api/file';

type State = {
  manualLink: boolean;
  selectedSeries: SeriesAniDBSearchResult;
  selectedFile: number;
  selectedRows: FileType[];
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
  },
});

export const { setManualLink, setSelectedSeries, setSelectedFile, setSelectedRows } = unrecognizedSlice.actions;

export default unrecognizedSlice.reducer;
