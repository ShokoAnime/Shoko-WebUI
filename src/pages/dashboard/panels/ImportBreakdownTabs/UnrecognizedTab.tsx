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
import { mdiFileFindOutline, mdiClipboardTextMultipleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import Checkbox from '../../../../components/Input/Checkbox';
import { markUnrecognizedFile } from '../../../../core/slices/mainpage';
import UnrecognizedAvdumpedItem from './UnrecognizedAvdumpedItem';

function UnrecognizedTab() {
  const dispatch = useDispatch();

  const avdumpKeyExists = useSelector((state: RootState) => !!state.localSettings.AniDb.AVDumpKey);
  const avdumpList = useSelector((state: RootState) => state.mainpage.avdump);
  const items = useSelector((state: RootState) => state.mainpage.unrecognizedFiles);
  const itemsMarked = useSelector((state: RootState) => state.mainpage.unrecognizedMark);

  const runAvdump = (fileId: number) => dispatch(
    { type: Events.MAINPAGE_FILE_AVDUMP, payload: fileId },
  );
  
  const markFile = (id: string) => {
    const state = itemsMarked.indexOf(id) === -1;
    dispatch(markUnrecognizedFile({ id, state }));
  };

  const renderItem = (item: FileType) => (
    <div key={item.ID} className="flex mt-3 first:mt-0 items-center">
      <Checkbox id={`${item.ID}`} isChecked={itemsMarked.indexOf(`${item.ID}`) !== -1} onChange={() => {markFile(`${item.ID}`);}} isSquare={true} className="mr-4" />
      {avdumpList[item.ID] && <UnrecognizedAvdumpedItem item={item} />}
      {avdumpList[item.ID] === undefined && (
      <div className="flex flex-col grow">
        <span className="font-semibold">{moment(item.Created).format('yyyy-MM-DD')} / {moment(item.Created).format('hh:mm A')}</span>
        <span className="flex break-words">{item.Locations[0].RelativePath}</span>
      </div>
      )}
      <div className="flex my-2 justify-between">
        {avdumpKeyExists && avdumpList[item.ID] === undefined && (
          <Button onClick={() => runAvdump(item.ID)} className="py-1 px-2 color-highlight-1" loading={avdumpList[item.ID]?.fetching}>
            <Icon path={mdiFileFindOutline} size={1} horizontal vertical rotate={180}/>
          </Button>
        )}
        {avdumpList[item.ID] && (
          <div className="py-1 px-2 cursor-pointer color-highlight-2">
          <CopyToClipboard text={avdumpList[item.ID]?.hash || ''} onCopy={() => toast.success('Copied to clipboard!')}>
            <Icon path={mdiClipboardTextMultipleOutline} size={1} horizontal vertical rotate={180} /> 
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
