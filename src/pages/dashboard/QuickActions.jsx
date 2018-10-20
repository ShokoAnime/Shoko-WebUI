// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { Table } from 'react-bulma-components';
import { connect } from 'react-redux';
import FixedPanel from '../../components/Panels/FixedPanel';
import QuickActionsItem from './QuickActionsItem';
import Events from '../../core/events';

type Props = {
  handleAction: () => void,
}

class QuickActions extends React.Component<Props> {
  static propTypes = {
    handleAction: PropTypes.func,
  };

  render() {
    const { handleAction } = this.props;

    return (
      <FixedPanel title="Quick Actions">
        <Table>
          <tbody>
            <QuickActionsItem index={1} name="Run Import" action="folder-import" onAction={handleAction} />
            <QuickActionsItem index={2} name="Remove Missing Files" action="remove-missing-files" onAction={handleAction} />
            <QuickActionsItem index={3} name="Update All Stats" action="stats-update" onAction={handleAction} />
            <QuickActionsItem index={4} name="Update All Media Info" action="mediainfo-update" onAction={handleAction} />
            <QuickActionsItem index={5} name="Plex Sync All" action="plex-sync" onAction={handleAction} />
          </tbody>
        </Table>
      </FixedPanel>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    handleAction: (value) => { dispatch({ type: Events.RUN_QUICK_ACTION, payload: value }); },
  };
}

export default connect(null, mapDispatchToProps)(QuickActions);
