import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../core/store';
import FixedPanel from '../../../components/Panels/FixedPanel';

class SeriesBreakdown extends React.Component<Props> {
  renderItem = (title: string, value = 0, key: string) => (
    <div key={key} className="flex mt-3 last:mt-0">
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
      MissingEpisodes, MissingEpisodesCollecting,
      SeriesWithMissingLinks, UnrecognizedFiles,
      EpisodesWithMultipleFiles, FilesWithDuplicateLocations,
      hasFetched,
    } = this.props;

    const childrenLeft = [
      this.renderItem('Missing Episodes (Collecting)', MissingEpisodesCollecting, 'missing-episodes-collecting'),
      this.renderItem('Missing Episodes (Total)', MissingEpisodes, 'missing-episodes'),
      this.renderItem('Missing TvDB/TMDB Links', SeriesWithMissingLinks, 'missing-links'),
    ];
    const childrenRight = [
      this.renderItem('Unrecognized Files', UnrecognizedFiles, 'unrecognized-files'),
      this.renderItem('Multiple Files', EpisodesWithMultipleFiles, 'multiple-files'),
      this.renderItem('Duplicate Files', FilesWithDuplicateLocations, 'duplicate-files'),
    ];

    return (
      <FixedPanel title="Series Breakdown" isFetching={!hasFetched}>
        <div className="flex font-semibold">
          <div className="flex flex-col w-1/2 mr-6">
            {childrenLeft}
          </div>
          <div className="flex flex-col w-1/2 ml-6">
            {childrenRight}
          </div>
        </div>
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
