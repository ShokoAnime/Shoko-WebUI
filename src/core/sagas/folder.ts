import { call, put, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { forEach } from 'lodash';

import toast from '../../components/Toast';
import ApiFolder from '../api/v3/folder';

import { RootState } from '../store';
import { startFetching, stopFetching } from '../slices/fetching';
import {
  setItems as setBrowseModalItems, setId as setBrowseModalId,
} from '../slices/modals/browseFolder';

import type { FolderType } from '../types/api/folder';

function* folderBrowse(action: PayloadAction<{ id: number; path: string }>) {
  let genId = yield select((state: RootState) => state.modals.browseFolder.id);
  const { id, path } = action.payload;

  yield put(startFetching(`browse-treenode-${id}`));
  const resultJson = yield call(path === '' ? ApiFolder.getFolderDrives : ApiFolder.getFolder, path);
  yield put(stopFetching(`browse-treenode-${id}`));

  if (resultJson.error) {
    toast.error(resultJson.message);
    return;
  }

  const nodes: Array<FolderType> = [];
  forEach(resultJson.data, (node: FolderType) => {
    if (node.CanAccess && node.DriveType !== 'Ram') {
      genId += 1;
      nodes.push(Object.assign({}, node, { nodeId: genId }));
    }
  });

  yield put(setBrowseModalId(genId));
  yield put(setBrowseModalItems({ key: id, nodes }));
}

export default {
  folderBrowse,
};
