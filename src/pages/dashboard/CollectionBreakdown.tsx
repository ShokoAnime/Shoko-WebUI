
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import FixedPanel from '../../components/Panels/FixedPanel';

type StateProps = {
  FileCount?: number;
  SeriesCount?: number;
  FileSize?: number;
  FinishedSeries?: number;
  WatchedEpisodes?: number;
  WatchedHours?: number;
};

type Props = StateProps;

class CollectionBreakdown extends React.Component<Props> {
  static propTypes = {
    FileCount: PropTypes.number,
    SeriesCount: PropTypes.number,
    FileSize: PropTypes.number,
    FinishedSeries: PropTypes.number,
    WatchedEpisodes: PropTypes.number,
    WatchedHours: PropTypes.number,
  };

  renderRow = (title: string, value: string | number = 0) => (
    <tr key={title}>
      <td className="py-2">{title}</td>
      <td className="py-2 color-accent" align="right">{value}</td>
    </tr>
  );

  render() {
    const {
      FileCount, SeriesCount, FileSize,
      FinishedSeries, WatchedEpisodes, WatchedHours,
    } = this.props;

    const columnLeft = [
      this.renderRow('Series', SeriesCount),
      this.renderRow('Files', FileCount),
      this.renderRow('Collection Size', `${prettyBytes(FileSize || 0)}`),
    ];
    const columnRight = [
      this.renderRow('Series Completed', FinishedSeries),
      this.renderRow('Episodes Watched', WatchedEpisodes),
      this.renderRow('Hours Watched', `${WatchedHours || 0} H`)];

    return (
      <FixedPanel title="Collection Breakdown">
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

function mapStateToProps(state): StateProps {
  const { dashboardStats } = state;
  const {
    FileCount, SeriesCount, FileSize,
    FinishedSeries, WatchedEpisodes, WatchedHours,
  } = dashboardStats;

  return {
    FileCount,
    SeriesCount,
    FileSize,
    FinishedSeries,
    WatchedEpisodes,
    WatchedHours,
  };
}

export default connect(mapStateToProps)(CollectionBreakdown);
