import { createSlice } from '@reduxjs/toolkit';
import { forEach } from 'lodash';

import { AVDumpEventTypeEnum } from '@/core/types/signalr';

import type { AVDumpEventType, AVDumpRestoreType } from '@/core/types/signalr';
import type { SliceActions } from '@/core/types/util';
import type { PayloadAction } from '@reduxjs/toolkit';

type AvDumpSession = {
  fileIDs: number[];
  status: 'Running' | 'Failed' | 'Success';
  progress: number;
};

type State = {
  sessions: Record<number, AvDumpSession>;
  sessionMap: Record<number, number>;
};

const avdumpSlice = createSlice({
  name: 'avdump',
  initialState: {
    sessionMap: {},
    sessions: {},
  } as State,
  reducers: {
    updateAVDumpEvent(sliceState, action: PayloadAction<AVDumpEventType>) {
      const event = action.payload;
      switch (event.Type) {
        case AVDumpEventTypeEnum.Started:
          sliceState.sessions[event.SessionID] = {
            status: 'Running',
            fileIDs: event.VideoIDs,
            progress: event.Progress,
          };
          forEach(event.VideoIDs, (fileId) => {
            sliceState.sessionMap[fileId] = event.SessionID;
          });
          break;

        case AVDumpEventTypeEnum.Success:
          if (sliceState.sessions[event.SessionID]) {
            const session = sliceState.sessions[event.SessionID];
            session.status = 'Success';
            session.progress = event.Progress;
          }
          break;

        case AVDumpEventTypeEnum.Failure:
          if (sliceState.sessions[event.SessionID]) {
            const session = sliceState.sessions[event.SessionID];
            session.status = 'Failed';
            session.progress = event.Progress;
          }
          break;

        case AVDumpEventTypeEnum.GenericException:
          if (sliceState.sessions[event.SessionID]) {
            const session = sliceState.sessions[event.SessionID];
            session.status = 'Failed';
            session.progress = 100;
          }
          break;

        default:
          break;
      }
    },
    restoreAVDumpSessions(sliceState, action: PayloadAction<AVDumpRestoreType[]>) {
      sliceState.sessionMap = {};
      sliceState.sessions = {};
      forEach(action.payload, (restore) => {
        sliceState.sessions[restore.SessionID] = {
          status: 'Running',
          fileIDs: restore.VideoIDs,
          progress: restore.Progress,
        };
        forEach(restore.VideoIDs, (fileId) => {
          sliceState.sessionMap[fileId] = restore.SessionID;
        });
      });
    },
  },
});

export const { restoreAVDumpSessions, updateAVDumpEvent } = avdumpSlice.actions;

export type AvdumpActionTypes = SliceActions<typeof avdumpSlice.actions>;

export default avdumpSlice.reducer;
