// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { Level, Panel } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

type Props = {
  title: any,
  description: string,
  className?: string,
  children: any,
  actionName?: string,
  onAction?: () => void
}

class FixedPanel extends React.Component<Props> {
  static propTypes = {
    title: PropTypes.any,
    description: PropTypes.string,
    children: PropTypes.any,
    actionName: PropTypes.string,
    onAction: PropTypes.func,
  };

  handleAction = () => {
    const { onAction } = this.props;
    if (typeof onAction === 'function') {
      onAction();
    }
  };

  renderButton() {
    const { actionName } = this.props;
    if (!actionName) { return null; }
    return (
      <Level.Side align="right">
        <Level.Item>
          <FontAwesomeIcon icon={faCog} onClick={this.handleAction} alt={actionName} />
        </Level.Item>
      </Level.Side>
    );
  }

  render() {
    const {
      children, title, className,
    } = this.props;
    return (
      <Panel className={className}>
        <Panel.Header>
          <Level>
            <Level.Item>
              {title}
            </Level.Item>
            {this.renderButton()}
          </Level>
        </Panel.Header>
        <Panel.Block>
          {children}
        </Panel.Block>
      </Panel>
    );
  }
}

export default FixedPanel;
