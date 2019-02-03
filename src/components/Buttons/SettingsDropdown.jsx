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

  handleChange = (value: string) => {
    const { name, onChange } = this.props;
    onChange(name, value);
  };

  renderItems() {
    const { values, value } = this.props;
    const items = [];
    let title;
    forEach(values, (tuple) => {
      items.push(<option key={tuple[0]} value={tuple[0]}>{tuple[1]}</option>);
      if (tuple[0] === value) title = tuple[1];
    });
    if (title === undefined && values.length !== 0) title = values[0][1];
    return { title, items };
  }

  render() {
    const { label, tooltip } = this.props;
    const { title, items } = this.renderItems();
    return (
      <FormGroup
        inline
        label={tooltip ? <SettingsTooltip label={label} text={tooltip} /> : label}
      >
        <HTMLSelect onChange={this.handleChange} value={title}>
          {items}
        </HTMLSelect>
      </FormGroup>
    );
  }
}
