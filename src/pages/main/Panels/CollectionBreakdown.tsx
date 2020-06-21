import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../../core/store';
import FixedPanel from '../../../components/Panels/FixedPanel';

class CollectionBreakdown extends React.Component<Props> {
  renderItem = (title: string, value: string | number = 0, key: string) => (
    <div key={key} className="flex my-2">
      <div className="flex-grow">
        {title}
      </div>
      <div className="color-accent">
        {value}
      </div>
    </div>
  );

  render() {
    const {
      FileCount, SeriesCount, FileSize, WatchedHours,
      FinishedSeries, WatchedEpisodes, hasFetched,
    } = this.props;

    const childrenLeft = [
      this.renderItem('Series', SeriesCount, 'series'),
      this.renderItem('Files', FileCount, 'files'),
      this.renderItem('Collection Size', `${prettyBytes(FileSize || 0)}`, 'collection-size'),
    ];
    const childrenRight = [
      this.renderItem('Series Completed', FinishedSeries, 'series-completed'),
      this.renderItem('Episodes Watched', WatchedEpisodes, 'episodes-watched'),
      this.renderItem('Hours Watched', `${WatchedHours || 0} H`, 'hours-watched')];

    return (
      <FixedPanel title="Collection Breakdown">
        {!hasFetched ? (
          <div className="flex justify-center items-center h-full">
            <FontAwesomeIcon icon={faCircleNotch} spin className="text-6xl color-accent-secondary" />
          </div>
        ) : (
          <div className="flex font-semibold">
            <div className="flex flex-col w-1/2 mr-6">
              {childrenLeft}
            </div>
            <div className="flex flex-col w-1/2 ml-6">
              {childrenRight}
            </div>
          </div>
        )}
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  ...state.mainpage.stats,
  hasFetched: state.mainpage.fetched.stats,
});

const connector = connect(mapState);

type Props = ConnectedProps<typeof connector>;

export default connector(CollectionBreakdown);
