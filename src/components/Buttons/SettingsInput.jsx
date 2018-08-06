/* eslint-disable prefer-destructuring */
// @flow
import PropTypes from 'prop-types';
import React from 'react';
import type { ComponentType } from 'react';
import {
  FormGroup, ControlLabel, Col, FormControl,
} from 'react-bootstrap';
import SettingsTooltip from '../SettingsTooltip';

type Props = {
  name: string,
  label: string,
  tooltip?: string | ComponentType<any>,
  value: string,
  onChange: (string, string) => void,
}

export default class SettingsInput extends React.Component<Props> {
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
      name, label, value, tooltip,
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
          <FormControl id={name} value={value} type="number" min="0" max="50" className="pull-right" onChange={this.handleChange} />
        </Col>
      </FormGroup>
    );
  }
}
