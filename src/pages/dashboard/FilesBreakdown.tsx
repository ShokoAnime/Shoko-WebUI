
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import FixedPanel from '../../components/Panels/FixedPanel';

type DashboardSeriesSummary = {
  Series: number;
  OVA: number;
  Movie: number;
  Other: number;
};

type StateProps = {
  seriesSummary?: DashboardSeriesSummary;
};

type Props = StateProps;

const colors = {
  Series: '#FF3F57',
  OVA: '#F1C40F',
  Movie: '#279CEB',
  Other: '#DA3FFF',
};

class FilesBreakdown extends React.Component<Props> {
  static propTypes = {
    seriesSummary: PropTypes.shape({
      Series: PropTypes.number.isRequired,
      OVA: PropTypes.number.isRequired,
      Movie: PropTypes.number.isRequired,
      Other: PropTypes.number.isRequired,
    }),
  };

  renderName = (item: string, count: number, countPercentage: number) => (
    <tr key={`${item}-name`}>
      <td className="py-2">
        {item} - {count}
      </td>
      <td className="py-2" align="right">
        {countPercentage.toFixed(2)}%
      </td>
    </tr>
  );

  renderBar = (item: string, countPercentage: number) => (
    <tr key={`${item}-bar`}>
      <td className="pb-6" colSpan={2}>
        <div className="bg-white rounded-lg">
          <div className="rounded-lg h-4" style={{ width: `${countPercentage}%`, backgroundColor: colors[item] }} />
        </div>
      </td>
    </tr>
  );

  render() {
    const { seriesSummary } = this.props;

    let total = 0;
    const seriesSummaryArray: any[] = [];

    forEach(seriesSummary, (item, key) => {
      total += item;
      seriesSummaryArray.push([key, item]);
    });

    seriesSummaryArray.sort((a, b) => (a[1] < b[1] ? 1 : -1));

    const items: any[] = [];

    forEach(seriesSummaryArray, (item) => {
      const countPercentage = (item[1] / total) * 100;
      items.push(this.renderName(item[0], item[1], countPercentage));
      items.push(this.renderBar(item[0], countPercentage));
    });

    return (
      <FixedPanel title="Files Breakdown">
        {items}
      </FixedPanel>
    );
  }
}

function mapStateToProps(state): StateProps {
  const {
    dashboardSeriesSummary,
  } = state;

  return {
    seriesSummary: dashboardSeriesSummary || {},
  };
}

export default connect(mapStateToProps, () => ({}))(FilesBreakdown);
