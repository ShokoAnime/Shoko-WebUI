import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../../core/store';
import FixedPanel from '../../../components/Panels/FixedPanel';

class SeriesBreakdown extends React.Component<Props> {
  renderItem = (title: string, value = 0) => (
    <div className="flex">
      <div className="flex-grow py-2">
        {title}
      </div>
      <div className="color-accent py-2">
        {value}
      </div>
    </div>
  );

  render() {
    const {
      MissingEpisodes, MissingEpisodesCollecting,
      SeriesWithMissingLinks, UnrecognizedFiles,
      EpisodesWithMultipleFiles, FilesWithDuplicateLocations,
      hasFetched,
    } = this.props;

    const childrenLeft = [
      this.renderItem('Missing Episodes (Collecting)', MissingEpisodesCollecting),
      this.renderItem('Missing Episodes (Total)', MissingEpisodes),
      this.renderItem('Missing TvDB/TMDB Links', SeriesWithMissingLinks),
    ];
    const childrenRight = [
      this.renderItem('Unrecognized Files', UnrecognizedFiles),
      this.renderItem('Multiple Files', EpisodesWithMultipleFiles),
      this.renderItem('Duplicate Files', FilesWithDuplicateLocations),
    ];

    return (
      <FixedPanel title="Series Breakdown">
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

export default connector(SeriesBreakdown);
