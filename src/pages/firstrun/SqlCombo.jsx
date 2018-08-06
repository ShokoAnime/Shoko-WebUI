// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import Autosuggest from 'react-bootstrap-autosuggest';
import {
  Col, ControlLabel, Button, FormGroup,
} from 'react-bootstrap';
import 'react-bootstrap-autosuggest/src/Autosuggest.scss';
import Events from '../../core/events';

type Props = {
  id: string,
  label: string,
  data: {},
  field: string,
  isHidden: boolean,
  onChange: (string, string) => void,
  getInstances: () => void,
  database: {
    instances: {}
  },
}


class SqlCombo extends React.Component<Props> {
  static propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    data: PropTypes.object,
    field: PropTypes.string,
    isHidden: PropTypes.bool,
    onChange: PropTypes.func,
    getInstances: PropTypes.func,
    database: PropTypes.object,
  };

  static defaultProps = {};

  render() {
    const {
      id, label, data, field, isHidden, onChange, getInstances, database,
    } = this.props;
    let items = [];

    if (typeof database.instances === 'object') {
      items = database.instances;
    }

    return (
      <FormGroup controlId={id} className={cx({ hidden: isHidden })}>
        <Col sm={2}>
          <ControlLabel>{label}</ControlLabel>
        </Col>
        <Col sm={5}>
          <Autosuggest
            datalist={items}
            value={data[field]}
            onChange={value => onChange(field, value)}
          />
        </Col>
        <Col sm={1}>
          <Button className="pull-right" bsStyle="primary" onClick={getInstances}>Scan</Button>
        </Col>
      </FormGroup>
    );
  }
}

function mapStateToProps(state) {
  const { firstrun, fetching } = state;

  return {
    isFetching: fetching.firstrunDatabase === true,
    ...firstrun,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getInstances: () => { dispatch({ type: Events.FIRSTRUN_GET_DATABASE_SQL_INSTANCES }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SqlCombo);
