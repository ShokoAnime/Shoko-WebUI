// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { forEach } from 'lodash';
import { Level, Panel } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

type Props = {
  title: any,
  className?: string,
  children: any,
  actionName?: string,
  nowrap?: boolean,
  onAction?: () => void
}

class FixedPanel extends React.Component<Props> {
  static propTypes = {
    title: PropTypes.any,
    children: PropTypes.any,
    actionName: PropTypes.string,
    nowrap: PropTypes.bool,
    onAction: PropTypes.func,
  };

  handleAction = () => {
    const { onAction } = this.props;
    if (typeof onAction === 'function') {
      onAction();
    }
  };

  renderButton = () => {
    const { actionName } = this.props;
    if (!actionName) { return null; }
    return (
      <Level.Side align="right">
        <Level.Item>
          <FontAwesomeIcon icon={faCog} onClick={this.handleAction} alt={actionName} />
        </Level.Item>
      </Level.Side>
    );
  };

  renderTitle = () => {
    const { title } = this.props;
    if (typeof title !== 'string') { return title; }
    const output = [];
    forEach(title.split(' '), (word, index) => {
      output.push(index % 2 !== 1 ? word : <span className="color">{word}</span>);
    });
    return output;
  };

  render() {
    const {
      children, nowrap, className,
    } = this.props;
    return (
      <Panel className={className}>
        <Panel.Header>
          <Level>
            <Level.Item>
              {this.renderTitle()}
            </Level.Item>
            {this.renderButton()}
          </Level>
        </Panel.Header>
        {nowrap === true ? children : (
          <Panel.Block>
            {children}
          </Panel.Block>
        )}
      </Panel>
    );
  }
}

export default FixedPanel;
