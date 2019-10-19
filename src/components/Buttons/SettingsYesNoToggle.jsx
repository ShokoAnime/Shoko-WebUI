// @flow
import PropTypes from 'prop-types';
import React from 'react';
import type { ComponentType } from 'react';
import { Switch } from '@blueprintjs/core';
import SettingsTooltip from '../SettingsTooltip';

import type { SettingBoolean } from '../../core/reducers/settings/Server';

type Props = {
  name: string,
  label: string,
  tooltip?: string | ComponentType<any>,
  value: boolean,
  onChange: (string, SettingBoolean) => void,
}

export default class SettingsYesNoToggle extends React.Component<Props> {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    tooltip: PropTypes.any,
    value: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
  };

  handleChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
    const { name, onChange } = this.props;
    onChange(name, event.target.checked);
  };

  render() {
    const {
      value, label, tooltip,
    } = this.props;
    if (tooltip) {
      return <Switch labelElement={<SettingsTooltip label={label} text={tooltip} />} large checked={value === true ? 1 : 0} onChange={this.handleChange} />;
    }
    return <Switch label={label} large checked={value === true ? 1 : 0} onChange={this.handleChange} />;
  }
}
