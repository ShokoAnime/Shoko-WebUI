import { call, put, select } from 'redux-saga/effects';
import { forEach } from 'lodash';

import Events from '../events';

import ApiFolder from '../api/v3/folder';

import { startFetching, stopFetching } from '../slices/fetching';
import {
  setItems as setBrowseModalItems, setId as setBrowseModalId,
} from '../slices/modals/browseFolder';

import type { FolderType } from '../types/api/folder';

function* folderBrowse(action) {
  let genId = yield select(state => state.modals.browseFolder.id);
  const { id, path } = action.payload;

  yield put(startFetching(`browse-treenode-${id}`));
  const resultJson = yield call(path === '' ? ApiFolder.getFolderDrives : ApiFolder.getFolder, path);
  yield put(stopFetching(`browse-treenode-${id}`));

  if (resultJson.error) {
    yield put({ type: Events.QUEUE_GLOBAL_ALERT, payload: { type: 'error', text: resultJson.message } });
    return;
  }

  const nodes: Array<any> = [];
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
