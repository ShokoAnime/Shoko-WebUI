// @flow
import React from 'react';
import type { ComponentType } from 'react';
import { Tooltip } from '@blueprintjs/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

type Props = {
  label?: string,
  text: string | ComponentType<any>,
}

export default class SettingsTooltip extends React.Component<Props> {
  render() {
    const { label, text } = this.props;

    return (
      <Tooltip content={text} className="settings-tooltip-icon">
        {label
          ? <span>{label}<FontAwesomeIcon icon={faQuestionCircle} /></span>
          : <FontAwesomeIcon icon={faQuestionCircle} />}
      </Tooltip>
    );
  }
}
