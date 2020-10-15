import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { forEach } from 'lodash';

import { RootState } from '../../../core/store';
import FixedPanel from '../../../components/Panels/FixedPanel';

const colors = {
  Series: '#FF3F57',
  OVA: '#F1C40F',
  Movie: '#279CEB',
  Other: '#DA3FFF',
};

class FilesBreakdown extends React.Component<Props> {
  renderName = (item: string, count: number, countPercentage: number) => (
    <div key={`${item}-name`} className="flex mt-3 mb-2">
      <span className="flex-grow">{item} - {count}</span>
      {countPercentage.toFixed(2)}%
    </div>
  );

  renderBar = (item: string, countPercentage: number) => (
    <div key={`${item}-bar`} className="flex bg-white rounded-lg mb-5">
      <div className="rounded-lg h-4" style={{ width: `${countPercentage}%`, backgroundColor: colors[item] }} />
    </div>
  );

  render() {
    const { seriesSummary, hasFetched } = this.props;

    let total = 0;
    const seriesSummaryArray: Array<any> = [];

    forEach(seriesSummary, (item, key) => {
      total += (item ?? 0);
      seriesSummaryArray.push([key, item]);
    });

    seriesSummaryArray.sort((a, b) => (a[1] < b[1] ? 1 : -1));

    const items: Array<any> = [];

    forEach(seriesSummaryArray, (item) => {
      let countPercentage = 0;
      if (total) {
        countPercentage = (item[1] / total) * 100;
      }
      items.push(this.renderName(item[0], item[1], countPercentage));
      items.push(this.renderBar(item[0], countPercentage));
    });

    return (
      <FixedPanel title="Files Breakdown" isFetching={!hasFetched}>
        {items}
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  seriesSummary: state.mainpage.seriesSummary,
  hasFetched: state.mainpage.fetched.seriesSummary,
});

const connector = connect(mapState);

type Props = ConnectedProps<typeof connector>;

export default connector(FilesBreakdown);
