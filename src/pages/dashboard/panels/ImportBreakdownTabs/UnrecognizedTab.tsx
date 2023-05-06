import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forEach, orderBy } from 'lodash';
import moment from 'moment';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Icon } from '@mdi/react';
import { mdiFileDocumentCheckOutline, mdiContentCopy, mdiTruck } from '@mdi/js';

import { RootState } from '../../../../core/store';
import Button from '../../../../components/Input/Button';

import { setItem as setAvdumpItem } from '../../../../core/slices/utilities/avdump';
import toast from '../../../../components/Toast';
import type { FileType } from '../../../../core/types/api/file';

import { useGetFileUnrecognizedQuery, useLazyPostFileAVDumpQuery } from '../../../../core/rtkQuery/splitV3Api/fileApi';

function UnrecognizedTab() {
  const dispatch = useDispatch();

  const items = useGetFileUnrecognizedQuery({ pageSize: 20 });
  const [avdumpTrigger] = useLazyPostFileAVDumpQuery();

  const avdumpList = useSelector((state: RootState) => state.utilities.avdump);

  const [dumpInProgress, setDumpInProgress] = useState(false);

  const avdumpFile = async (fileId: number) => {
    setDumpInProgress(true);
    dispatch(setAvdumpItem({ id: fileId, hash: '', fetching: true }));
    const result = await avdumpTrigger(fileId);
    dispatch(setAvdumpItem({ id: fileId, hash: result.data?.Ed2k ?? 'x', fetching: false }));
    setDumpInProgress(false);
  };

  const renderItem = (item: FileType) => (
    <div key={item.ID} className="flex mt-3 first:mt-0 items-center">
      {/*{avdumpList[item.ID] && <UnrecognizedAvdumpedItem item={item} hash={avdumpList[item.ID].hash} />}*/}
      {avdumpList[item.ID] === undefined &&  (
      <div className="flex flex-col grow">
        <span className="font-semibold">{moment(item.Created).format('yyyy-MM-DD')} / {moment(item.Created).format('hh:mm A')}</span>
        <span className= "break-all max-w-[95%]">{item.Locations[0].RelativePath}</span>
      </div>
      )}
      {avdumpList[item.ID] && (
          <div className="flex flex-col grow">
            <span className="font-semibold">{moment(item.Created).format('yyyy-MM-DD')} / {moment(item.Created).format('hh:mm A')}</span>
            <span className="break-all max-w-[95%]">{item.Locations[0].RelativePath}</span>
          </div>
      )}
      <div className="flex my-2 justify-between">
        {(avdumpList[item.ID] === undefined || avdumpList[item.ID].fetching) && (
          <Button onClick={() => avdumpFile(item.ID)} className="py-1 px-2" loading={avdumpList[item.ID]?.fetching ?? false} disabled={dumpInProgress}>
            <Icon className="text-highlight-1" path={mdiTruck} size={1} />
          </Button>
        )}
        {(avdumpList[item.ID] && !avdumpList[item.ID].fetching) && (
          <div className="flex py-1 px-2 gap-2">
            <CopyToClipboard text={avdumpList[item.ID].hash || ''} onCopy={() => toast.success('Copied to clipboard!')}>
              <Icon className='text-highlight-1 cursor-pointer' path={mdiContentCopy} size={1} />
            </CopyToClipboard>
            <Icon className='text-highlight-2' path={mdiFileDocumentCheckOutline} size={1} />
          </div>
        )}
      </div>
    </div>
  );

  const sortedItems = orderBy(items.data?.List, ['ID'], ['desc']);
  const files: Array<React.ReactNode> = [];

  forEach(sortedItems, (item) => {
    if (item?.Locations && item?.Locations?.length !== 0) {
      files.push(renderItem(item));
    }
  });

  if (files.length === 0) {
    files.push(<div className="flex justify-center font-semibold mt-4" key="no-files">No Unrecognized Files, Good Job!</div>);
  }

  return (<React.Fragment>{files}</React.Fragment>);
}

export default UnrecognizedTab;
