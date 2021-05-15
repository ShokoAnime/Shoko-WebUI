import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach, orderBy } from 'lodash';
import moment from 'moment';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';

import { RootState } from '../../../../core/store';
import Events from '../../../../core/events';
import Button from '../../../../components/Buttons/Button';

import type { RecentFileType } from '../../../../core/types/api/file';

class UnrecognizedTab extends React.Component<Props> {
  renderItem = (item: RecentFileType) => {
    const { runAvdump, avdumpList, avdumpKeyExists } = this.props;
    return (
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
  };

  render() {
    const { items } = this.props;

    const sortedItems = orderBy(items, ['ID'], ['desc']);
    const files: Array<any> = [];

    forEach(sortedItems, (item) => {
      if (item?.Locations && item?.Locations?.length !== 0) {
        files.push(this.renderItem(item));
      }
    });

    if (files.length === 0) {
      files.push(<div className="flex justify-center font-bold mt-4">No unrecognized files!</div>);
    }

    return files;
  }
}

const mapState = (state: RootState) => ({
  avdumpList: state.mainpage.avdump,
  items: state.mainpage.unrecognizedFiles as Array<RecentFileType>,
  avdumpKeyExists: !!state.localSettings.AniDb.AVDumpKey,
});

const mapDispatch = {
  runAvdump: (fileId: number) => (
    { type: Events.MAINPAGE_FILE_AVDUMP, payload: fileId }
  ),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(UnrecognizedTab);
