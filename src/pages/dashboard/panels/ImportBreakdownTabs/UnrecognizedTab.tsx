import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forEach, orderBy } from 'lodash';
import moment from 'moment';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';

import { RootState } from '../../../../core/store';
import Events from '../../../../core/events';
import Button from '../../../../components/Input/Button';

import type { FileType } from '../../../../core/types/api/file';

function UnrecognizedTab() {
  const dispatch = useDispatch();

  const avdumpKeyExists = useSelector((state: RootState) => !!state.localSettings.AniDb.AVDumpKey);
  const avdumpList = useSelector((state: RootState) => state.mainpage.avdump);
  const items = useSelector((state: RootState) => state.mainpage.unrecognizedFiles);

  const runAvdump = (fileId: number) => dispatch(
    { type: Events.MAINPAGE_FILE_AVDUMP, payload: fileId },
  );

  const renderItem = (item: FileType) => (
    <div key={item.ID} className="flex flex-col mt-3 first:mt-0">
      <span className="font-semibold">{moment(item.Created).format('yyyy-MM-DD')} / {moment(item.Created).format('hh:mm A')}</span>
      <div className="flex my-2 justify-between">
        <span className="flex break-words">{item.Locations[0].RelativePath}</span>
        {avdumpKeyExists && (
          <Button onClick={() => runAvdump(item.ID)} className="font-exo font-bold text-sm bg-color-highlight-1 py-1 px-2" loading={avdumpList[item.ID]?.fetching}>
            Avdump
          </Button>
        )}
      </div>
      <div className="flex">
        {avdumpList[item.ID]?.hash && (
          <div className="flex">
            <span className="w-48 font-semibold">ED2K Hash:</span>
            <CopyToClipboard text={avdumpList[item.ID]?.hash || ''} onCopy={() => toast.success('Copied to clipboard!')}>
              <span className="break-all cursor-pointer">{avdumpList[item.ID].hash}</span>
            </CopyToClipboard>
          </div>
        )}
      </div>
    </div>
  );

  const sortedItems = orderBy(items, ['ID'], ['desc']);
  const files: Array<React.ReactNode> = [];

  forEach(sortedItems, (item) => {
    if (item?.Locations && item?.Locations?.length !== 0) {
      files.push(renderItem(item));
    }
  });

  if (files.length === 0) {
    files.push(<div className="flex justify-center font-bold mt-4">No unrecognized files!</div>);
  }

  return (<React.Fragment>{files}</React.Fragment>);
}

export default UnrecognizedTab;
