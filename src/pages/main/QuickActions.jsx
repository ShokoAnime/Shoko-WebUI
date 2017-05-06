import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import FixedPanel from '../../components/Panels/FixedPanel';
import QuickActionsItem from './QuickActionsItem';
import Events from '../../core/events';

class QuickActions extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    handleAction: PropTypes.func,
  };

  render() {
    const { className, handleAction } = this.props;

    return (
      <div className={className}>
        <FixedPanel title="Quick Actions">
          <table className="table">
            <tbody>
              <QuickActionsItem index="1" name="Remove Missing Files" action="remove_missing_files" onAction={handleAction} />
              <QuickActionsItem index="2" name="Update All Stats" action="stats_update" onAction={handleAction} />
              <QuickActionsItem index="3" name="Update All Media Info" action="mediainfo_update" onAction={handleAction} />
            </tbody>
          </table>
        </FixedPanel>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    handleAction: (value) => { dispatch({ type: Events.RUN_QUICK_ACTION, payload: value }); },
  };
}

export default connect(null, mapDispatchToProps)(QuickActions);
