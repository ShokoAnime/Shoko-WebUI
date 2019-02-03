// @flow
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import {
  Collapse, FormGroup, InputGroup,
} from '@blueprintjs/core';

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
      <Collapse isOpen={!isHidden}>
        <FormGroup inline label={label} className={cx({ hidden: isHidden })}>
          <InputGroup id={id} placeholder="" value={data[field]} onChange={event => onChange(field, event.target.value)} />
        </FormGroup>
      </Collapse>
    );
  }
}
