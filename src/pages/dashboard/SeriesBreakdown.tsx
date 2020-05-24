
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import FixedPanel from '../../components/Panels/FixedPanel';

type StateProps = {
  MissingEpisodes?: number;
  MissingEpisodesCollecting?: number;
  SeriesWithMissingLinks?: number;
  UnrecognizedFiles?: number;
  EpisodesWithMultipleFiles?: number;
  FilesWithDuplicateLocations?: number;
};

type Props = StateProps;

class SeriesBreakdown extends React.Component<Props> {
  static propTypes = {
    MissingEpisodes: PropTypes.number,
    MissingEpisodesCollecting: PropTypes.number,
    SeriesWithMissingLinks: PropTypes.number,
    UnrecognizedFiles: PropTypes.number,
    EpisodesWithMultipleFiles: PropTypes.number,
    FilesWithDuplicateLocations: PropTypes.number,
  };

  renderRow = (title: string, value = 0) => (
    <tr key={title}>
      <td className="py-2">{title}</td>
      <td className="py-2 color-accent" align="right">
        {value}
      </td>
    </tr>
  );

  render() {
    const {
      MissingEpisodes, MissingEpisodesCollecting,
      SeriesWithMissingLinks, UnrecognizedFiles,
      EpisodesWithMultipleFiles, FilesWithDuplicateLocations,
    } = this.props;

    const columnLeft = [
      this.renderRow('Missing Episodes (Collecting)', MissingEpisodesCollecting),
      this.renderRow('Missing Episodes (Total)', MissingEpisodes),
      this.renderRow('Missing TvDB/TMDB Links', SeriesWithMissingLinks),
    ];
    const columnRight = [
      this.renderRow('Unrecognized Files', UnrecognizedFiles),
      this.renderRow('Multiple Files', EpisodesWithMultipleFiles),
      this.renderRow('Duplicate Files', FilesWithDuplicateLocations),
    ];

    return (
      <FixedPanel title="Series Breakdown">
        <tr>
          <td className="w-1/2">
            <table className="table-auto w-full">
              <tbody>{columnLeft}</tbody>
            </table>
          </td>
          <td className="px-8" />
          <td className="w-1/2">
            <table className="table-auto w-full">
              <tbody>{columnRight}</tbody>
            </table>
          </td>
        </tr>
      </FixedPanel>
    );
  }
}

function mapStateToProps(state) {
  const { dashboardStats } = state;
  const {
    MissingEpisodes, MissingEpisodesCollecting,
    SeriesWithMissingLinks, UnrecognizedFiles,
    EpisodesWithMultipleFiles, FilesWithDuplicateLocations,
  } = dashboardStats;

  return {
    MissingEpisodes,
    MissingEpisodesCollecting,
    SeriesWithMissingLinks,
    UnrecognizedFiles,
    EpisodesWithMultipleFiles,
    FilesWithDuplicateLocations,
  };
}

export default connect(mapStateToProps, () => ({}))(SeriesBreakdown);
