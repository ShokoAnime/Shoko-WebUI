// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  Panel, Checkbox, Button, Form, FormGroup, ControlLabel, FormControl,
} from 'react-bootstrap';
import { setFilters, setKeyword } from '../../core/actions/logs/Filters';

type LogFilters = {
  error: boolean,
  info: boolean,
  trace: boolean,
}

type Props = {
  keyword: string,
  tags: LogFilters,
  updateFilters: (LogFilters) => void,
  updateKeyword: (string) => void,
}

type State = {
  keyword: string,
}

class LogSettings extends React.Component<Props, State> {
  static propTypes = {
    keyword: PropTypes.string.isRequired,
    tags: PropTypes.object.isRequired,
    updateFilters: PropTypes.func.isRequired,
    updateKeyword: PropTypes.func.isRequired,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      keyword: props.keyword,
    };
  }

  applySettings = () => {
    const { tags, updateKeyword, updateFilters } = this.props;
    const { keyword } = this.state;
    const filterValues = {
      error: !!(this.cbError && this.cbError.checked),
      info: !!(this.cbInfo && this.cbInfo.checked === true),
      trace: !!(this.cbTrace && this.cbTrace.checked === true),
    };

    const updatedFilters = Object.assign({}, tags, filterValues);
    updateKeyword(keyword);
    updateFilters(updatedFilters);
  };

  updateKeyword = (event) => {
    const keyword = event.target.value;
    this.setState({ keyword });
  };

  cbError: ?HTMLInputElement;

  cbInfo: ?HTMLInputElement;

  cbTrace: ?HTMLInputElement;

  render() {
    return (
      <Panel>
        <Form inline>
          <FormGroup controlId="keyword">
            <ControlLabel>Filter by</ControlLabel>
            {' '}
            <FormControl
              onChange={this.updateKeyword}
              type="text"
              placeholder="keyword"
            />
          </FormGroup>
          <FormGroup controlId="tags">
            <Checkbox inline defaultChecked inputRef={(ref) => { this.cbError = ref; }}>
              Errors
            </Checkbox>
            <Checkbox inline defaultChecked inputRef={(ref) => { this.cbInfo = ref; }}>
              Info
            </Checkbox>
            <Checkbox inline defaultChecked inputRef={(ref) => { this.cbTrace = ref; }}>
              Trace
            </Checkbox>
          </FormGroup>
          <Button onClick={this.applySettings} style={{ marginLeft: '10px' }}>Apply</Button>
        </Form>
      </Panel>
    );
  }
}

function mapStateToProps(state) {
  const { keyword } = state.logs;
  const { tags } = state.logs.filters;
  return {
    keyword,
    tags,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateFilters: (value: LogFilters) => dispatch(setFilters(value)),
    updateKeyword: value => dispatch(setKeyword(value)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LogSettings);
