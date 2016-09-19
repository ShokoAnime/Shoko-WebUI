import React, { PropTypes } from 'react';
import FixedPanel from '../../components/Panels/FixedPanel';
import QuickActionsItem from './QuickActionsItem';

class QuickActions extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    lastUpdated: PropTypes.number,
  };

  render() {
    const { lastUpdated } = this.props;
    const shouldComeFromStore = ['Run Import', 'Update Images', 'Sync Votes',
      'Remove Missing Files', 'Update All Stats', 'Update All TvDB Info'];
    const actions = [];

    for (const [index, item] of shouldComeFromStore.entries()) {
      actions.push(<QuickActionsItem key={index} index={index + 1} name={item} />);
    }

    return (
      <div className={this.props.className}>
        <FixedPanel
          title="Quick Actions"
          description="Can be changed on the Actions tab"
          lastUpdated={lastUpdated}
        >
          <table className="table">
            <tbody>
            {actions}
            </tbody>
          </table>
        </FixedPanel>
      </div>
    );
  }
}

export default QuickActions;
