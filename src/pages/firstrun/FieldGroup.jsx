import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { Col, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';

export default class FieldGroup extends React.Component {
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
        <Col componentClass={ControlLabel} sm={2}>
          {label}
        </Col>
        <Col sm={6}>
          <FormControl placeholder="" value={data[field]} onChange={event => onChange(field, event.target.value)} />
          {/* <HelpBlock>Help text with validation state.</HelpBlock> */}
        </Col>
      </FormGroup>
    );
  }
}
