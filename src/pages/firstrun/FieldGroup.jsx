// @flow
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { Col, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';

type Props = {
  id: string,
  label: string,
  data: {},
  field: string,
  isHidden: boolean,
  onChange: (string, string) => void,
}

export default class FieldGroup extends React.Component<Props> {
  static propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    data: PropTypes.object,
    field: PropTypes.string,
    isHidden: PropTypes.bool,
    onChange: PropTypes.func,
  };

  render() {
    const {
      id, label, data, field, isHidden, onChange,
    } = this.props;

    return (
      <FormGroup controlId={id} className={cx({ hidden: isHidden })} /* validationState="error" */>
        <Col sm={2}>
          <ControlLabel>{label}</ControlLabel>
        </Col>
        <Col sm={6}>
          <FormControl placeholder="" value={data[field]} onChange={event => onChange(field, event.target.value)} />
        </Col>
      </FormGroup>
    );
  }
}
