// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Modal, Container } from 'react-bulma-components';
import { ControlGroup, Button } from '@blueprintjs/core';
import { setStatus } from '../../core/actions/modals/QuickActions';
import { settingsQuickActions } from '../../core/actions/settings/QuickActions';
import FixedPanel from '../Panels/FixedPanel';
import QuickActionName from '../../pages/actions/QuickActionName';
import Events from '../../core/events';

import type { QuickActionPayloadType } from '../../core/reducers/settings/QuickActions';

type Props = {
  status: boolean,
  actions: Array<string>,
  action: string,
  handleClose: () => void,
  saveActions: () => void,
  pinAction: (QuickActionPayloadType) => void,
}

class QuickActionModal extends React.Component<Props> {
  pinAction = (id: string) => {
    const { actions, action, pinAction } = this.props;
    const slot = actions.indexOf(id);
    pinAction({ id: action, slot });
  };

  saveActions = () => {
    const { saveActions } = this.props;
    saveActions();
  };

  renderAction = action => (
    <ControlGroup key={action} className="action-row">
      <QuickActionName id={action} />
      <Button onClick={() => this.pinAction(action)}>Use</Button>
    </ControlGroup>
  );

  render() {
    const { actions, status, handleClose } = this.props;

    return (
      <Modal show={status} onClose={handleClose} className="quick-actions-modal">
        <Modal.Content>
          <FixedPanel title="Pin quick action">
            <Container>
              {actions.map(this.renderAction)}
              <Button className="is-pulled-right" intent="primary" onClick={this.saveActions}>
                Save
              </Button>
            </Container>
          </FixedPanel>
        </Modal.Content>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  const { settings, modals } = state;
  const { quickActions } = modals;
  const { status, action } = quickActions;

  return {
    status,
    action,
    actions: settings.quickActions,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    handleClose: () => dispatch(setStatus(false)),
    pinAction: (value: QuickActionPayloadType) => {
      dispatch(settingsQuickActions(value));
    },
    saveActions: (value: QuickActionPayloadType) => {
      dispatch({ type: Events.SETTINGS_SAVE_QUICK_ACTION, payload: value });
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(QuickActionModal);
