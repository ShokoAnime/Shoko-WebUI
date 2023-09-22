import { createSlice } from '@reduxjs/toolkit';
import { forEach } from 'lodash';

import { AVDumpEventTypeEnum } from '@/core/types/signalr';

import type { AVDumpEventType, AVDumpRestoreType } from '@/core/types/signalr';
import type { PayloadAction } from '@reduxjs/toolkit';
import { SliceActions } from '@/core/types/util';

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
      switch (event.type) {
        case AVDumpEventTypeEnum.Started:
          sliceState.sessions[event.sessionID] = {
            status: 'Running',
            fileIDs: event.videoIDs,
            progress: event.progress,
          };
          forEach(event.videoIDs, (fileId) => {
            sliceState.sessionMap[fileId] = event.sessionID;
          });
          break;

        case AVDumpEventTypeEnum.Success:
          if (sliceState.sessions[event.sessionID]) {
            const session = sliceState.sessions[event.sessionID];
            session.status = 'Success';
            session.progress = event.progress;
          }
          break;

        case AVDumpEventTypeEnum.Failure:
          if (sliceState.sessions[event.sessionID]) {
            const session = sliceState.sessions[event.sessionID];
            session.status = 'Failed';
            session.progress = event.progress;
          }
          break;

        case AVDumpEventTypeEnum.GenericException:
          if (sliceState.sessions[event.sessionID]) {
            const session = sliceState.sessions[event.sessionID];
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
        sliceState.sessions[restore.sessionID] = {
          status: 'Running',
          fileIDs: restore.videoIDs,
          progress: restore.progress,
        };
        forEach(restore.videoIDs, (fileId) => {
          sliceState.sessionMap[fileId] = restore.sessionID;
        });
      });
    },
  },
});

export const { restoreAVDumpSessions, updateAVDumpEvent } = avdumpSlice.actions;

export type AvdumpActionTypes = SliceActions<typeof avdumpSlice.actions>;

export default avdumpSlice.reducer;
