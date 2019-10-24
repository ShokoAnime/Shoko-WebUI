/* eslint-disable prefer-destructuring */
// @flow
import PropTypes from 'prop-types';
import React from 'react';
import type { ComponentType } from 'react';
import { forEach } from 'lodash';
import { FormGroup, HTMLSelect } from '@blueprintjs/core';
import SettingsTooltip from '../SettingsTooltip';

type Props = {
  name: string,
  label: string,
  tooltip?: string | ComponentType<any>,
  values: Array<Array<string>>,
  value: string,
  onChange: (string, string) => void,
}

export default class SettingsDropdown extends React.Component<Props> {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    tooltip: PropTypes.any,
    values: PropTypes.array,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  };

  getItems() {
    const { values } = this.props;
    const items = [];
    forEach(values, (tuple) => {
      items.push({ label: tuple[1], value: tuple[0] });
    });
    return items;
  }

  handleChange = (event: SyntheticEvent) => {
    const { name, onChange } = this.props;
    onChange(name, event.currentTarget.value);
  };

  render() {
    const { label, tooltip, value } = this.props;
    return (
      <FormGroup
        inline
        label={tooltip ? <SettingsTooltip label={label} text={tooltip} /> : label}
      >
        <HTMLSelect options={this.getItems()} onChange={this.handleChange} value={value} />
      </FormGroup>
    );
  }
}
