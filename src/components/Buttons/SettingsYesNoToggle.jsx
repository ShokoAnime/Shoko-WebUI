// @flow
import PropTypes from 'prop-types';
import React from 'react';
import type { ComponentType } from 'react';
import { FormGroup, ControlLabel, Col, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import SettingsTooltip from '../SettingsTooltip';

import type { SettingBoolean } from '../../core/reducers/settings/Server';

type Props = {
  name: string,
  label: string,
  tooltip?: string | ComponentType<any>,
  value: 'True' | 'False',
  onChange: (string, SettingBoolean) => void,
}

export default class SettingsYesNoToggle extends React.Component<Props> {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    tooltip: PropTypes.any,
    value: PropTypes.oneOf(['True', 'False']),
    onChange: PropTypes.func.isRequired,
  };

  handleChange = (value: number) => {
    const { name } = this.props;
    this.props.onChange(name, value === 1 ? 'True' : 'False');
  };

  render() {
    const {
      value, name, label, tooltip,
    } = this.props;
    return (
      <FormGroup controlId={name}>
        <Col sm={6}>
          <ControlLabel>
            {label}
            {tooltip && <SettingsTooltip name={name} text={tooltip} />}
          </ControlLabel>
        </Col>
        <Col sm={6}>
          <ToggleButtonGroup
            type="radio"
            name={name}
            value={value === 'True' ? 1 : 0}
            onChange={this.handleChange}
            className="pull-right"
          >
            <ToggleButton bsStyle="settings-no" value={0}>No</ToggleButton>
            <ToggleButton bsStyle="settings-yes" value={1}>Yes</ToggleButton>
          </ToggleButtonGroup>
        </Col>
      </FormGroup>
    );
  }
}

