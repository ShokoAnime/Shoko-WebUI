// @flow
import PropTypes from 'prop-types';
import React from 'react';
import type { ComponentType } from 'react';
import { FormGroup, Slider } from '@blueprintjs/core';
import SettingsTooltip from '../SettingsTooltip';

type Props = {
  name: string,
  label: string,
  tooltip?: string | ComponentType<any>,
  value: string,
  onChange: (string, string) => void,
}

export default class SettingsSlider extends React.Component<Props> {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    tooltip: PropTypes.any,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  };

  handleChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
    const { name, onChange } = this.props;
    onChange(name, event.target.value);
  };

  render() {
    const {
      label, value, tooltip,
    } = this.props;
    return (
      <FormGroup
        inline
        label={tooltip ? <SettingsTooltip label={label} text={tooltip} /> : label}
      >
        <Slider
          stepSize={5}
          min={0}
          max={20}
          onChange={this.handleChange}
          value={parseFloat(value)}
        />
      </FormGroup>
    );
  }
}
