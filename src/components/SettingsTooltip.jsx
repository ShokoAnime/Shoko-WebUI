// @flow
import React from 'react';
import type { ComponentType } from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

type Props = {
  name: string,
  text: string | ComponentType<any>,
}

export default class SettingsTooltip extends React.Component<Props> {
  render() {
    const { name, text } = this.props;
    const component = (
      <Tooltip className="settings" id={`tip-${name}`}>
        {text}
      </Tooltip>
    );

    return (
      <OverlayTrigger placement="top" overlay={component}>
        <i className="fa fa-question-circle icon-settings-info" />
      </OverlayTrigger>
    );
  }
}
