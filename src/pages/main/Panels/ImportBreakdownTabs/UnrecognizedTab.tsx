import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach } from 'lodash';
import moment from 'moment';

import { RootState } from '../../../../core/store';
import Events from '../../../../core/events';
import type { RecentFileType } from '../../../../core/types/api/file';
import Button from '../../../../components/Buttons/Button';


class UnrecognizedTab extends React.Component<Props> {
  renderItem = (item: RecentFileType) => {
    const { runAvdump, avdumpList } = this.props;
    return (
      <div key={item.ID} className="flex flex-col mt-2">
        <span className="font-semibold">{moment(item.Created).format('yyyy-MM-DD')} / {moment(item.Created).format('hh:mm A')}</span>
        <div className="flex my-2 justify-between">
          <span className="flex break-words">{item.Locations[0].RelativePath}</span>
          <span>
            <Button onClick={() => runAvdump(item.ID)} className="font-exo font-bold text-sm bg-color-accent py-1 px-2" loading={avdumpList[item.ID]?.fetching}>
              Avdump
            </Button>
          </span>
        </div>
        <div className="flex mb-1">
          {avdumpList[item.ID].hash && (
            <div className="flex">
              <span className="w-48 font-semibold">ED2K Hash:</span>
              <span className="break-all">{avdumpList[item.ID].hash}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  render() {
    const { items } = this.props;

    const files: Array<any> = [];

    forEach(items, (item) => {
      files.push(this.renderItem(item));
    });

    if (files.length === 0) {
      files.push(<div className="flex justify-center font-bold mt-4">No unrecognized files!</div>);
    }

    return files;
  }
}

const mapState = (state: RootState) => ({
  avdumpList: state.mainpage.avdump,
});

const mapDispatch = {
  runAvdump: (fileId: number) => (
    { type: Events.MAINPAGE_FILE_AVDUMP, payload: fileId }
  ),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & {
  items: Array<RecentFileType>,
};

export default connector(UnrecognizedTab);
