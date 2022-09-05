import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forEach, orderBy } from 'lodash';
import moment from 'moment';
import CopyToClipboard from 'react-copy-to-clipboard';

import toast from '../../../../components/Toast';
import { RootState } from '../../../../core/store';
import Button from '../../../../components/Input/Button';

import type { FileType } from '../../../../core/types/api/file';
import { mdiHelpCircleOutline, mdiClipboardTextMultipleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import Checkbox from '../../../../components/Input/Checkbox';
import { markUnrecognizedFile } from '../../../../core/slices/mainpage';
import UnrecognizedAvdumpedItem from './UnrecognizedAvdumpedItem';

import { useGetFileUnrecognizedQuery, useLazyPostFileAVDumpQuery } from '../../../../core/rtkQuery/fileApi';

function UnrecognizedTab() {
  const dispatch = useDispatch();

  const [avdumpList, setAvdumpList] = useState([] as Array<string>);

  const items = useGetFileUnrecognizedQuery({ pageSize: 0 });
  const itemsMarked = useSelector((state: RootState) => state.mainpage.unrecognizedMark);
  const [avdumpTrigger, avdumpResult] = useLazyPostFileAVDumpQuery();

  const runAvdump = async (fileId: number) => {
    const result = await avdumpTrigger(fileId);
    if (result.data?.Ed2k) {
      const tempAvdumpList = [...avdumpList];
      tempAvdumpList[fileId] = result.data.Ed2k;
      setAvdumpList(tempAvdumpList);
    }
  };

  const markFile = (id: string) => {
    const state = itemsMarked.indexOf(id) === -1;
    dispatch(markUnrecognizedFile({ id, state }));
  };

  const renderItem = (item: FileType) => (
    <div key={item.ID} className="flex mt-3 first:mt-0 items-center">
      <Checkbox id={`${item.ID}`} isChecked={itemsMarked.indexOf(`${item.ID}`) !== -1} onChange={() => {markFile(`${item.ID}`);}} className="mr-4" />
      {avdumpList[item.ID] && <UnrecognizedAvdumpedItem item={item} hash={avdumpList[item.ID]} />}
      {avdumpList[item.ID] === undefined && (
      <div className="flex flex-col grow">
        <span className="font-semibold">{moment(item.Created).format('yyyy-MM-DD')} / {moment(item.Created).format('hh:mm A')}</span>
        <span className="flex break-words">{item.Locations[0].RelativePath}</span>
      </div>
      )}
      <div className="flex my-2 justify-between">
        {avdumpList[item.ID] === undefined && (
          <Button onClick={() => runAvdump(item.ID)} className="py-1 px-2" loading={avdumpResult.isFetching}>
            <Icon className="text-highlight-1" path={mdiHelpCircleOutline} size={1} horizontal vertical rotate={180}/>
          </Button>
        )}
        {avdumpList[item.ID] && (
          <div className="py-1 px-2 cursor-pointer text-highlight-2">
          <CopyToClipboard text={avdumpList[item.ID] || ''} onCopy={() => toast.success('Copied to clipboard!')}>
            <Icon path={mdiClipboardTextMultipleOutline} size={1} horizontal vertical rotate={180} />
          </CopyToClipboard>
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
    files.push(<div className="flex justify-center font-semibold mt-4">No Unrecognized Files, Good Job!</div>);
  }

  return (<React.Fragment>{files}</React.Fragment>);
}

export default UnrecognizedTab;
