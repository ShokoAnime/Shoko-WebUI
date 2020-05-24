
// import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import FixedPanel from '../../components/Panels/FixedPanel';
import Button from '../../components/Buttons/Button';

// type Props = {
//   seriesSummary: DashboardSeriesSummary;
// };


class ActionItems extends React.Component<{}> {
  renderRow = () => (
    <tr>
      <td>Run Import</td>
      <td><Button onClick={() => {}}>Run</Button></td>
    </tr>
  );

  render() {
    const items: any[] = [];

    items.push(this.renderRow());
    items.push(this.renderRow());
    items.push(this.renderRow());
    items.push(this.renderRow());
    items.push(this.renderRow());
    items.push(this.renderRow());

    return (
      <FixedPanel title="Action Items">
        {items}
      </FixedPanel>
    );
  }
}

// function mapStateToProps(state) {
//   const { dashboardSeriesSummary } = state;

//   return {
//     seriesSummary: dashboardSeriesSummary || {},
//   };
// }

export default connect(() => ({}), () => ({}))(ActionItems);
